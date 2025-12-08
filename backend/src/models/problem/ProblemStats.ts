import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemStats extends Document {
  problem: Types.ObjectId;
  totalSubmissions: number;
  acceptedSubmissions: number;
}

const problemStatsSchema = new Schema<IProblemStats>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true, unique: true },

    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProblemStats = mongoose.model<IProblemStats>(
  "ProblemStats",
  problemStatsSchema
);
