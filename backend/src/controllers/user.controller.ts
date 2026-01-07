import { Preferences } from "../models/user/Preferences";
import { Stats } from "../models/user/Stats";
import { RecentSubmission } from "../models/user/RecentSubmission";
import { User } from "../models/user/User";
import { Request, Response } from "express";
import Submission from "../models/submission/Submission";
import { Problem } from "../models/problem/Problem";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Get user data
    const userData = await User.findById(user._id).select(
      "username fullName email gender bio avatar github linkedin"
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

    // For testing - create dummy recent problems if none exist
    let testRecentProblems = recentProblems;
    

    // For testing - add some dummy stats if all are 0
    let testStats = {
      totalSolved: stats.totalSolved,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved
    };
    if (stats.totalSolved === 0) {
      testStats = {
        totalSolved: 326,
        easySolved: 180,
        mediumSolved: 120,
        hardSolved: 26
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        stats: testStats,
        submissions: submissions.map(sub => ({
          date: sub.createdAt.toISOString(),
          status: "ACCEPTED"
        })),
        recentProblems: testRecentProblems
      }
    });
    
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
    const { fullName, gender, bio, avatar, github, linkedin } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        fullName,
        gender,
        bio,
        avatar,
        github,
        linkedin
      },
      { new: true }
    ).select("username fullName email gender bio avatar github linkedin");

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

   const preferences =  await Preferences.findOneAndUpdate(
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
