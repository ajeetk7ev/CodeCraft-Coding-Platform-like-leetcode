import mongoose, { Schema, Document, Types } from "mongoose";

export interface IContestParticipant extends Document {
  user: Types.ObjectId;
  contest: Types.ObjectId;
  solvedProblems: Types.ObjectId[]; // List of problems solved in this contest
  score: number;
  penalty: number; // Penalty time in minutes or seconds
  lastSolvedAt?: Date;
  isVirtual: boolean;
  virtualStartTime?: Date;
  attempts: { problem: Types.ObjectId; failedCount: number }[];
}

const contestParticipantSchema = new Schema<IContestParticipant>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contest: { type: Schema.Types.ObjectId, ref: "Contest", required: true },
    solvedProblems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
    score: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    lastSolvedAt: { type: Date },
    isVirtual: { type: Boolean, default: false },
    virtualStartTime: { type: Date },
    attempts: [
      {
        problem: { type: Schema.Types.ObjectId, ref: "Problem" },
        failedCount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

// Unique index to ensure a user joins a contest only once
contestParticipantSchema.index({ user: 1, contest: 1 }, { unique: true });

export const ContestParticipant = mongoose.model<IContestParticipant>(
  "ContestParticipant",
  contestParticipantSchema,
);
