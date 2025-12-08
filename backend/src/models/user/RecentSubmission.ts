import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRecentSubmission extends Document {
  user: Types.ObjectId;
  problem: Types.ObjectId;
  status: string;
  submittedAt: Date;
}

const recentSubmissionSchema = new Schema<IRecentSubmission>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },

    status: { type: String, required: true }, // Accepted, Failed, TLE
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


export const RecentSubmission = mongoose.model<IRecentSubmission>(
  "RecentSubmission",
  recentSubmissionSchema
);
