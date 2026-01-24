import { Request, Response } from "express";
import { QueueEvents } from "bullmq";
import Submission from "../models/submission/Submission";
import { Problem } from "../models/problem/Problem";
import { ProblemBoilerplate } from "../models/problem/ProblemBoilerplate";
import {
  runCodeSchema,
  submitCodeSchema,
} from "../validations/submission.schema";
import { runQueue } from "../queue/run.queue";
import { submitQueue } from "../queue/submit.queue";
import { SubmissionStatus } from "../models/submission/SubmissionStatus";
import { Verdict } from "../models/submission/verdict";
import { redis } from "../config/redis";
import { Contest } from "../models/contest/Contest";
import { ContestParticipant } from "../models/contest/ContestParticipant";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

/**
 * Run code without submitting (for testing)
 */
export const runCode = catchAsync(async (req: Request, res: Response) => {
  const parsed = runCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { slug, code, language, testcases } = parsed.data;

  const problem = await Problem.findOne({ slug });
  if (!problem) {
    throw new AppError("Problem not found", 404);
  }

  // Get boilerplate for the problem and language
  const boilerplate = await ProblemBoilerplate.findOne({
    problem: problem._id,
    language,
  });

  // Combine user code with fullCodeTemplate
  let fullCode = code;
  if (boilerplate && boilerplate.fullCodeTemplate) {
    // Replace userCodeTemplate in fullCodeTemplate with actual user code
    fullCode = boilerplate.fullCodeTemplate.replace("{{USER_CODE}}", code);
  }

  // // push ONE job with multiple testcases
  const job = await runQueue.add("run-code", {
    code: fullCode,
    language,
    testcases,
  });

  const queueEvents = new QueueEvents("code-run", { connection: redis });

  const result = (await job.waitUntilFinished(queueEvents)) as any;

  return res.json({
    success: true,
    data: result, // array of testcase results
  });
});

/**
 * Submit code for a problem
 */
export const submitCode = catchAsync(async (req: Request, res: Response) => {
  const parsed = submitCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { code, language, problemId, contestId } = parsed.data;
  const userId = (req as any).user._id;

  // If submitting for a contest, verify participation and timing
  if (contestId) {
    const contest = await Contest.findById(contestId);
    if (!contest) {
      throw new AppError("Contest not found", 404);
    }

    const participant = await ContestParticipant.findOne({
      user: userId,
      contest: contestId,
    });
    if (!participant) {
      throw new AppError("You must join the contest to participate", 403);
    }

    const now = new Date();
    if (participant.isVirtual) {
      // PERSONALIZED TIMING FOR VIRTUAL PARTICIPANTS
      const contestDuration =
        new Date(contest.endTime).getTime() -
        new Date(contest.startTime).getTime();
      const virtualEndTime = new Date(
        new Date(participant.virtualStartTime!).getTime() + contestDuration,
      );

      if (now > virtualEndTime) {
        throw new AppError("Your virtual contest session has ended", 403);
      }
    } else {
      // OFFICIAL CONTEST TIMING
      if (now < new Date(contest.startTime)) {
        throw new AppError("Contest has not started yet", 403);
      }
      if (now > new Date(contest.endTime)) {
        throw new AppError("Contest has ended", 403);
      }
    }
  }

  // Verify problem exists
  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new AppError("Problem not found", 404);
  }

  // Get boilerplate for the problem and language
  const boilerplate = await ProblemBoilerplate.findOne({
    problem: problemId,
    language,
  });

  // Combine user code with fullCodeTemplate
  let fullCode = code;
  if (boilerplate && boilerplate.fullCodeTemplate) {
    // Replace userCodeTemplate in fullCodeTemplate with actual user code
    fullCode = boilerplate.fullCodeTemplate.replace("{{USER_CODE}}", code);
  }

  // Create submission record
  const submission = await Submission.create({
    user: userId,
    problem: problemId,
    contest: contestId,
    code,
    language,
    verdict: Verdict.COMPILE_ERROR,
    status: SubmissionStatus.QUEUED,
    testcaseResults: [],
  });

  // Add job to submit queue with the full code
  await submitQueue.add("submit-code", {
    submissionId: String(submission._id),
    code: fullCode,
    language,
    problemId,
  });

  return res.status(201).json({
    success: true,
    message: "Code submitted successfully",
    data: {
      submissionId: submission._id,
      status: submission.status,
    },
  });
});

/**
 * Get submission by ID
 */
export const getSubmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const submission = await Submission.findById(id)
    .populate("user", "username email")
    .populate("problem", "title slug difficulty");

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  // Check if user owns the submission or is admin
  let submissionUserId: string;
  if (
    typeof submission.user === "object" &&
    submission.user !== null &&
    "_id" in submission.user
  ) {
    submissionUserId = String((submission.user as any)._id);
  } else {
    submissionUserId = String(submission.user);
  }
  const isOwner = submissionUserId === String(userId);
  const isAdmin = (req as any).user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Not authorized to view this submission", 403);
  }

  return res.json({
    success: true,
    data: submission,
  });
});

/**
 * Get all submissions for a user
 */
export const getUserSubmissions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const { problemId, page = 1, limit = 10 } = req.query;

    const query: any = { user: userId };
    if (problemId) {
      query.problem = problemId;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const submissions = await Submission.find(query)
      .populate("problem", "title slug difficulty")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Submission.countDocuments(query);

    return res.json({
      success: true,
      message: "Submissions fetched successfully",
      data: submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  },
);

/**
 * Get all submissions for a problem (admin only)
 */
export const getProblemSubmissions = catchAsync(
  async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const submissions = await Submission.find({ problem: problemId })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Submission.countDocuments({ problem: problemId });

    return res.json({
      success: true,
      data: submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  },
);
