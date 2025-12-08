import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStats extends Document {
  user: Types.ObjectId;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  languagesUsed: string[];
}

const statsSchema = new Schema<IStats>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },

    languagesUsed: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Stats = mongoose.model<IStats>("Stats", statsSchema);
