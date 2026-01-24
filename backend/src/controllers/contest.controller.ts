import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { catchAsync } from "../utils/catchAsync";
import jwt from "jsonwebtoken";
import { Contest } from "../models/contest/Contest";
import { ContestParticipant } from "../models/contest/ContestParticipant";
import { Problem } from "../models/problem/Problem";
import {
  createContestSchema,
  updateContestSchema,
} from "../validations/contest.schema";
import { User } from "../models/user/User";
import Submission from "../models/submission/Submission";

export const createContest = catchAsync(async (req: Request, res: Response) => {
  const parsed = createContestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const {
    title,
    description,
    startTime,
    endTime,
    problems,
    isRated,
    status,
    registrationDeadline,
  } = parsed.data;
  const userId = (req as any).user._id;

  const contest = new Contest({
    title,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    problems,
    createdBy: userId,
    isRated: isRated ?? false,
    status: status || "draft",
    registrationDeadline: registrationDeadline
      ? new Date(registrationDeadline)
      : undefined,
  });

  await contest.save();

  res.status(201).json({
    success: true,
    data: contest,
  });
});

export const getContests = catchAsync(async (req: Request, res: Response) => {
  let isAdmin = false;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET || "default_secret",
        );
        const user = await User.findById(decoded.id);
        if (user && user.role === "admin") {
          isAdmin = true;
        }
      }
    } catch (error) {
      // Invalid token, treat as public
    }
  }

  const query = isAdmin
    ? {}
    : {
        $or: [
          { status: "published" },
          { status: { $exists: false } }, // Handle legacy contests with no status field
        ],
      };

  const contests = await Contest.find(query).sort({ startTime: -1 });
  res.status(200).json({
    success: true,
    data: contests,
  });
});

export const getContestById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const contest = await Contest.findById(id).populate("problems");

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    const authHeader = req.headers.authorization;
    let hasJoined = false;
    let isVirtual = false;
    let virtualStartTime: Date | null | undefined = null;
    let solvedProblems: any[] = [];
    let userScore = 0;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        if (token) {
          const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET || "default_secret",
          );
          const participant = await ContestParticipant.findOne({
            user: decoded.id,
            contest: id,
          });
          if (participant) {
            hasJoined = true;
            isVirtual = participant.isVirtual;
            virtualStartTime = participant.virtualStartTime;
            solvedProblems = participant.solvedProblems;
            userScore = participant.score;
          }
        }
      } catch (err) {
        // Ignore invalid token, just treat as not joined
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...contest.toObject(),
        hasJoined,
        isVirtual,
        virtualStartTime,
        solvedProblems,
        userScore,
      },
    });
  },
);

export const joinContest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const contest = await Contest.findById(id);
  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  // Check registration deadline if it exists
  if (
    contest.registrationDeadline &&
    new Date() > new Date(contest.registrationDeadline)
  ) {
    return res.status(400).json({
      success: false,
      message: "Registration closed. Deadline passed.",
    });
  }

  // Only allow joining before the contest starts (if strict) or just check deadline
  if (new Date() > new Date(contest.endTime)) {
    // Check strictness logic here if needed
  }

  if (new Date() > new Date(contest.startTime)) {
    return res.status(400).json({
      success: false,
      message: "Registration closed. Contest has already started.",
    });
  }

  // Check if user already joined
  const existing = await ContestParticipant.findOne({
    user: userId,
    contest: id,
  });
  if (existing) {
    return res.status(400).json({
      success: true,
      message: "Already joined this contest",
      data: existing,
    });
  }

  const participant = new ContestParticipant({
    user: userId,
    contest: id,
  });

  await participant.save();

  res.status(201).json({
    success: true,
    message: "Successfully joined the contest",
    data: participant,
  });
});

export const getContestLeaderboard = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const leaderboard = await ContestParticipant.find({ contest: id })
      .populate("user", "username avatar rating")
      .sort({ score: -1, penalty: 1, lastSolvedAt: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  },
);

export const updateContest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateContestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const {
    title,
    description,
    startTime,
    endTime,
    problems,
    isRated,
    status,
    registrationDeadline,
  } = parsed.data;

  const updateData: any = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (startTime) updateData.startTime = new Date(startTime);
  if (endTime) updateData.endTime = new Date(endTime);
  if (problems) updateData.problems = problems;
  if (isRated !== undefined) updateData.isRated = isRated;
  if (status) updateData.status = status;
  if (registrationDeadline)
    updateData.registrationDeadline = new Date(registrationDeadline);

  const contest = await Contest.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  res.status(200).json({
    success: true,
    data: contest,
  });
});

export const deleteContest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contest = await Contest.findByIdAndDelete(id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  // Also delete participants
  await ContestParticipant.deleteMany({ contest: id });

  res.status(200).json({
    success: true,
    message: "Contest deleted successfully",
  });
});
export const virtualJoin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const contest = await Contest.findById(id);
  if (!contest) {
    return res
      .status(404)
      .json({ success: false, message: "Contest not found" });
  }

  // Only allow virtual join if the contest has ended
  if (new Date() < new Date(contest.endTime)) {
    return res.status(400).json({
      success: false,
      message: "Contest is still live. Join officially instead.",
    });
  }

  // Check if already joined (either officially or virtually)
  const existing = await ContestParticipant.findOne({
    user: userId,
    contest: id,
  });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Already participated in this contest",
    });
  }

  const participant = new ContestParticipant({
    user: userId,
    contest: id,
    isVirtual: true,
    virtualStartTime: new Date(),
  });

  await participant.save();

  res.status(201).json({
    success: true,
    message: "Virtual participation started!",
    data: participant,
  });
});

export const getContestSubmissions = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const submissions = await Submission.find({
      contest: id,
      user: userId,
    })
      .populate("problem", "title slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  },
);

export const finishContestAndCalculateRatings = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const contest = await Contest.findById(id);

    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    if (!contest.isRated) {
      return res
        .status(400)
        .json({ success: false, message: "This contest is not rated" });
    }

    if (new Date() < new Date(contest.endTime)) {
      return res
        .status(400)
        .json({ success: false, message: "Contest is still running" });
    }

    // Get all participants (official only)
    const participants = await ContestParticipant.find({
      contest: id,
      isVirtual: false,
    }).sort({ score: -1, penalty: 1, lastSolvedAt: 1 });

    if (participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Not enough participants for rating update",
      });
    }

    // Fetch user ratings
    const userIds = participants.map((p) => p.user);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((u) => [(u._id as any).toString(), u]));

    // Basic ELO-like rating update (Simplified for demonstration)
    const ratingChanges = [];
    for (let i = 0; i < participants.length; i++) {
      const p1 = participants[i];
      const u1 = userMap.get(p1!.user.toString());
      if (!u1) continue;

      let expectedScore = 0;
      let actualScore =
        (participants.length - 1 - i) / (participants.length - 1);

      for (let j = 0; j < participants.length; j++) {
        if (i === j) continue;
        const p2 = participants[j];
        const u2 = userMap.get(p2!.user.toString());
        if (!u2) continue;

        expectedScore += 1 / (1 + Math.pow(10, (u2.rating - u1.rating) / 400));
      }
      expectedScore /= participants.length - 1;

      const K = 32;
      const change = Math.round(K * (actualScore - expectedScore));

      u1.rating += change;
      if (!u1.ratingHistory) u1.ratingHistory = [];
      u1.ratingHistory.push({
        rating: u1.rating,
        date: new Date(),
        contestId: contest._id,
      });
      await u1.save();
      ratingChanges.push({
        userId: u1._id,
        oldRating: u1.rating - change,
        newRating: u1.rating,
        change,
      });
    }

    res.status(200).json({
      success: true,
      message: "Ratings updated successfully",
      data: ratingChanges,
    });
  },
);
