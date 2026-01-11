import { Request, Response } from "express";
import { User } from "../models/user/User";
import { Problem } from "../models/problem/Problem";
import Submission from "../models/submission/Submission";
import { Stats } from "../models/user/Stats";
import { Verdict } from "../models/submission/verdict";
import { redis } from "../config/redis";

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const CACHE_KEY = "admin:dashboard:stats";
    const cachedStats = await redis.get(CACHE_KEY);

    if (cachedStats) {
      return res.json({
        success: true,
        data: JSON.parse(cachedStats),
      });
    }

    const [
      totalProblems,
      totalUsers,
      totalSubmissions,
      totalAccepted,
      totalAdmins,
      totalBannedUsers,
    ] = await Promise.all([
      Problem.countDocuments(),
      User.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ verdict: Verdict.ACCEPTED }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ banned: true }),
    ]);

    const stats = {
      totalProblems,
      totalUsers,
      totalSubmissions,
      totalAccepted,
      totalAdmins,
      totalBannedUsers,
    };

    await redis.set(CACHE_KEY, JSON.stringify(stats), "EX", 1800);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get submissions per day for the last 30 days
export const getSubmissionsPerDay = async (req: Request, res: Response) => {
  try {
    const CACHE_KEY = "admin:submissions:daily";
    const cachedSubmissions = await redis.get(CACHE_KEY);

    if (cachedSubmissions) {
      return res.json({
        success: true,
        data: JSON.parse(cachedSubmissions),
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissions = await Submission.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    await redis.set(CACHE_KEY, JSON.stringify(submissions), "EX", 1800);

    return res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Error in getSubmissionsPerDay:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get AC vs WA ratio
export const getAcVsWaRatio = async (req: Request, res: Response) => {
  try {
    const CACHE_KEY = "admin:ratio:ac-vs-wa";
    const cachedRatio = await redis.get(CACHE_KEY);

    if (cachedRatio) {
      return res.json({
        success: true,
        data: JSON.parse(cachedRatio),
      });
    }

    const [accepted, wrongAnswer] = await Promise.all([
      Submission.countDocuments({ verdict: Verdict.ACCEPTED }),
      Submission.countDocuments({ verdict: Verdict.WRONG_ANSWER }),
    ]);

    const ratioData = {
      accepted,
      wrongAnswer,
      total: accepted + wrongAnswer,
    };

    await redis.set(CACHE_KEY, JSON.stringify(ratioData), "EX", 1800);

    return res.json({
      success: true,
      data: ratioData,
    });
  } catch (error) {
    console.error("Error in getAcVsWaRatio:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get most solved problems
export const getMostSolvedProblems = async (req: Request, res: Response) => {
  try {
    const CACHE_KEY = "admin:problems:most-solved";
    const cachedProblems = await redis.get(CACHE_KEY);

    if (cachedProblems) {
      return res.json({
        success: true,
        data: JSON.parse(cachedProblems),
      });
    }

    const problems = await Submission.aggregate([
      {
        $match: { verdict: Verdict.ACCEPTED },
      },
      {
        $group: {
          _id: "$problem",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problem",
        },
      },
      {
        $unwind: "$problem",
      },
      {
        $project: {
          _id: 0,
          problemId: "$_id",
          title: "$problem.title",
          slug: "$problem.slug",
          difficulty: "$problem.difficulty",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    await redis.set(CACHE_KEY, JSON.stringify(problems), "EX", 1800);

    return res.json({
      success: true,
      data: problems,
    });
  } catch (error) {
    console.error("Error in getMostSolvedProblems:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get difficulty distribution
export const getDifficultyDistribution = async (req: Request, res: Response) => {
  try {
    const CACHE_KEY = "admin:problems:difficulty-distribution";
    const cachedDist = await redis.get(CACHE_KEY);

    if (cachedDist) {
      return res.json({
        success: true,
        data: JSON.parse(cachedDist),
      });
    }

    const distribution = await Problem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          difficulty: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    await redis.set(CACHE_KEY, JSON.stringify(distribution), "EX", 1800);

    return res.json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error("Error in getDifficultyDistribution:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all users with pagination and search
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, role, banned } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search as string, $options: "i" } },
        { fullName: { $regex: search as string, $options: "i" } },
        { email: { $regex: search as string, $options: "i" } },
      ];
    }

    if (role && ["user", "admin"].includes(role as string)) {
      query.role = role;
    }

    if (banned !== undefined) {
      query.banned = banned === "true";
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select("-password -verificationToken -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Ban/Unban user
export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { banned } = req.body;

    if (typeof banned !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Banned status must be a boolean",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { banned },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
    });
  } catch (error) {
    console.error("Error in toggleUserBan:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Assign role to user
export const assignUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error("Error in assignUserRole:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get user stats for admin view
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("username fullName email");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [stats, submissions] = await Promise.all([
      Stats.findOne({ user: userId }),
      Submission.find({ user: userId }),
    ]);

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(
      (s) => s.verdict === Verdict.ACCEPTED
    ).length;
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

    return res.json({
      success: true,
      data: {
        user: user,
        stats: stats || {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
        },
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Toggle problem publish status
export const toggleProblemPublish = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    const { published } = req.body;

    if (typeof published !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Published status must be a boolean",
      });
    }

    const problem = await Problem.findByIdAndUpdate(
      problemId,
      { published },
      { new: true }
    ).populate("createdBy", "username email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.json({
      success: true,
      data: problem,
      message: `Problem ${published ? "published" : "unpublished"} successfully`,
    });
  } catch (error) {
    console.error("Error in toggleProblemPublish:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};