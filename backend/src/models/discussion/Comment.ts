import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  discussion: Types.ObjectId;
  parentComment?: Types.ObjectId;
  replies: Types.ObjectId[];
  upvotes: number;
  downvotes: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    discussion: {
      type: Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Index for fetching comments for a discussion
commentSchema.index({ discussion: 1, parentComment: 1 });

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
