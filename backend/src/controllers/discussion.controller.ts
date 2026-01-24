import { Request, Response } from "express";
import { Discussion } from "../models/discussion/Discussion";
import { Comment } from "../models/discussion/Comment";
import { Vote } from "../models/discussion/Vote";
import mongoose from "mongoose";
import { catchAsync } from "../utils/catchAsync";

// --- Discussion Controllers ---

export const createDiscussion = catchAsync(
  async (req: Request, res: Response) => {
    const { title, content, category, tags } = req.body;
    const author = (req as any).user._id;

    const discussion = await Discussion.create({
      title,
      content,
      category,
      tags,
      author,
    });

    return res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      data: discussion,
    });
  },
);

export const getDiscussions = catchAsync(
  async (req: Request, res: Response) => {
    const {
      category,
      search,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search as string, "i")] } },
      ];
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === "trending") sortOptions = { views: -1, upvotes: -1 };
    if (sort === "upvoted") sortOptions = { upvotes: -1 };

    const discussions = await Discussion.find(query)
      .populate("author", "username fullName avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Discussion.countDocuments(query);

    return res.json({
      success: true,
      data: discussions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  },
);

export const getDiscussionById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const discussion = await Discussion.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("author", "username fullName avatar");

    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });
    }

    return res.json({ success: true, data: discussion });
  },
);

export const updateDiscussion = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = (req as any).user._id;

    const discussion = await Discussion.findOne({ _id: id, author: userId });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found or unauthorized",
      });
    }

    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.category = category || discussion.category;
    discussion.tags = tags || discussion.tags;

    await discussion.save();

    return res.json({
      success: true,
      message: "Discussion updated successfully",
      data: discussion,
    });
  },
);

export const deleteDiscussion = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const discussion = await Discussion.findOneAndDelete({
      _id: id,
      author: userId,
    });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found or unauthorized",
      });
    }

    // Delete related comments and votes
    await Comment.deleteMany({ discussion: id });
    await Vote.deleteMany({ targetId: id, targetType: "Discussion" });

    return res.json({
      success: true,
      message: "Discussion deleted successfully",
    });
  },
);

// --- Comment Controllers ---

export const addComment = catchAsync(async (req: Request, res: Response) => {
  const { discussionId } = req.params;
  const { content, parentCommentId } = req.body;
  const author = (req as any).user._id;

  const comment = await Comment.create({
    content,
    author,
    discussion: discussionId,
    parentComment: parentCommentId || null,
  });

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: comment._id },
    });
  }

  await Discussion.findByIdAndUpdate(discussionId, {
    $inc: { commentCount: 1 },
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "username fullName avatar",
  );

  return res.status(201).json({
    success: true,
    message: "Comment added",
    data: populatedComment,
  });
});

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const { discussionId } = req.params;
  const { parentCommentId = null } = req.query;

  const comments = await Comment.find({
    discussion: discussionId,
    parentComment: parentCommentId === "null" ? null : parentCommentId,
  })
    .populate("author", "username fullName avatar")
    .populate({
      path: "replies",
      populate: { path: "author", select: "username fullName avatar" },
    })
    .sort({ createdAt: -1 });

  return res.json({ success: true, data: comments });
});

// --- Voting Logic ---

export const toggleVote = catchAsync(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { targetId } = req.params;
    const { targetType, voteType } = req.body; // voteType: 1 or -1
    const userId = (req as any).user._id;

    const existingVote = await Vote.findOne({
      user: userId,
      targetId,
      targetType,
    }).session(session);

    let voteChange = 0;
    let removeExisting = false;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type clicked again
        voteChange = -voteType;
        removeExisting = true;
      } else {
        // Change vote type
        voteChange = voteType * 2;
        existingVote.voteType = voteType as any;
        await existingVote.save({ session });
      }
    } else {
      // New vote
      voteChange = voteType;
      await Vote.create([{ user: userId, targetId, targetType, voteType }], {
        session,
      });
    }

    if (removeExisting) {
      await Vote.deleteOne({ _id: existingVote?._id }).session(session);
    }

    const Model = (targetType === "Discussion" ? Discussion : Comment) as any;
    const field = voteType === 1 ? "upvotes" : "downvotes";

    if (existingVote && !removeExisting) {
      // Switched from up to down or vice-versa
      const otherField = voteType === 1 ? "downvotes" : "upvotes";
      await Model.findByIdAndUpdate(
        targetId,
        {
          $inc: { [field]: 1, [otherField]: -1 },
        },
        { session },
      );
    } else {
      await Model.findByIdAndUpdate(
        targetId,
        {
          $inc: { [field]: voteChange > 0 ? 1 : -1 },
        },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({ success: true, message: "Vote updated" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error; // Re-throw to be caught by catchAsync
  }
});
