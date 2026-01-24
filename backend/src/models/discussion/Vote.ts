import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVote extends Document {
  user: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: "Discussion" | "Comment";
  voteType: 1 | -1; // 1 for upvote, -1 for downvote
}

const voteSchema = new Schema<IVote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: {
      type: String,
      enum: ["Discussion", "Comment"],
      required: true,
    },
    voteType: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true },
);

// Ensure a user can only vote once on a specific target
voteSchema.index({ user: 1, targetId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>("Vote", voteSchema);
