import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemTag extends Document {
  problem: Types.ObjectId;
  tag: string;
}

const problemTagSchema = new Schema<IProblemTag>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    tag: { type: String, required: true },
  },
  { timestamps: true }
);


export const ProblemTag = mongoose.model<IProblemTag>(
  "ProblemTag",
  problemTagSchema
);
