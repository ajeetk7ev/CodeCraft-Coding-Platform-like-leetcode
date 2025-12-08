import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemDescription extends Document {
  problem: Types.ObjectId;
  description: string;
  constraints: string[];
}

const problemDescriptionSchema = new Schema<IProblemDescription>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true, unique: true },

    description: { type: String, required: true },
    constraints: [{ type: String }],
  },
  { timestamps: true }
);

export const ProblemDescription = mongoose.model<IProblemDescription>(
  "ProblemDescription",
  problemDescriptionSchema
);
