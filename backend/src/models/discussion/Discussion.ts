import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDiscussion extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  views: number;
  pinned: boolean;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "General",
        "Interview Question",
        "Interview Experience",
        "Career",
        "Feedback",
        "Support",
      ],
    },
    tags: [{ type: String }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes for search and performance
discussionSchema.index({ title: "text", content: "text", tags: "text" });
discussionSchema.index({ category: 1 });
discussionSchema.index({ createdAt: -1 });

export const Discussion = mongoose.model<IDiscussion>(
  "Discussion",
  discussionSchema,
);
