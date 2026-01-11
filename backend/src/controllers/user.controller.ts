import { Preferences } from "../models/user/Preferences";
import { Stats } from "../models/user/Stats";
import { RecentSubmission } from "../models/user/RecentSubmission";
import { User } from "../models/user/User";
import { Request, Response } from "express";
import Submission from "../models/submission/Submission";
import { Problem } from "../models/problem/Problem";
import uploadImageToCloudinary from "../utils/imageUpload";
import { checkAndResetStreak } from "../utils/streak.utils";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Check and reset streak if missed
    await checkAndResetStreak(String(user._id));

    // Get user data
    const userData = await User.findById(user._id).select(
      "username fullName email gender bio avatar github linkedin role currentStreak longestStreak lastActivity"
    );

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userResponse = {
      id: userData._id,
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      gender: userData.gender,
      bio: userData.bio,
      avatar: userData.avatar,
      github: userData.github,
      linkedin: userData.linkedin,
      role: userData.role,
      currentStreak: userData.currentStreak,
      longestStreak: userData.longestStreak,
    };

    // Get stats (create if doesn't exist)
    let stats = await Stats.findOne({ user: user._id }).select(
      "totalSolved easySolved mediumSolved hardSolved"
    );

    // console.log("User stats:", stats);

    if (!stats) {
      stats = await Stats.create({
        user: user._id,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0
      });
    }

    // Calculate Global Rank
    const rank = await Stats.countDocuments({
      totalSolved: { $gt: stats.totalSolved }
    }) + 1;

    // Get total problems count
    const totalQuestions = await Problem.countDocuments();

    // Get recent submissions for activity heatmap (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const submissions = await Submission.find({
      user: user._id,
      createdAt: { $gte: oneYearAgo },
      verdict: "ACCEPTED" // Only count accepted submissions for heatmap
    }).select("createdAt");

    // Get recent solved problems (last 10)
    const recentSubmissions = await RecentSubmission.find({ user: user._id })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate("problem", "title difficulty");

    const recentProblems = recentSubmissions.map(sub => ({
      title: (sub.problem as any).title,
      difficulty: (sub.problem as any).difficulty.charAt(0).toUpperCase() + (sub.problem as any).difficulty.slice(1),
      date: sub.submittedAt.toISOString()
    }));

    const responseData = {
      success: true,
      data: {
        user: userResponse,
        stats: {
          totalSolved: stats.totalSolved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          rank,
          totalQuestions
        },
        submissions: submissions.map(sub => ({
          date: sub.createdAt.toISOString(),
          status: "ACCEPTED"
        })),
        recentProblems: recentProblems
      }
    };

    console.log("getProfile Response Data:", JSON.stringify(responseData, null, 2));

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {

    const user = (req as any).user;
    const { fullName, gender, bio, github, linkedin } = req.body;

    let avatarUrl;

    if ((req as any).file) {
      const file = (req as any).file;
      console.log("File object:", file);
      console.log("File path:", file.path);
      console.log("File buffer:", !!file.buffer);
      try {
        const result = await uploadImageToCloudinary(file, "avatars");
        avatarUrl = result.secure_url;
        // No need to clean up for memory storage
      } catch (uploadError) {
        console.log("Upload error:", uploadError);
        throw uploadError;
      }
    }


    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        fullName,
        gender,
        bio,
        avatar: avatarUrl ? avatarUrl : user.avatar,
        github,
        linkedin
      },
      { new: true }
    ).select("username fullName email gender bio avatar github linkedin role currentStreak longestStreak lastActivity");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userResponse = {
      id: updatedUser._id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      github: updatedUser.github,
      linkedin: updatedUser.linkedin,
      role: updatedUser.role,
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fontSize } = req.body;

    if (!fontSize) {
      return res.status(400).json({
        success: false,
        message: "fontSize is required",
      });
    }

    const preferences = await Preferences.findOneAndUpdate(
      { user: user._id },        // find by user
      { $set: { fontSize } },    // update fields
      {
        new: true,               // return updated doc
        upsert: true,            // CREATE if not exists
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Preferences saved successfully",
    });
  } catch (error) {
    console.error("Update Preferences Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStreak = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Check and reset streak if missed
    await checkAndResetStreak(String(user._id));

    const userData = await User.findById(user._id).select(
      "currentStreak longestStreak"
    );

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        currentStreak: userData.currentStreak,
        longestStreak: userData.longestStreak,
      },
    });
  } catch (error) {
    console.error("Get Streak Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

