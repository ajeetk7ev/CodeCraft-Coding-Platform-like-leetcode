import mongoose, { Schema, Document } from "mongoose";

export interface IProblemExample extends Document {
  input: string;
  output: string;
  explanation?: string;
  problem: mongoose.Types.ObjectId; // reference to Problem
}

const ProblemExampleSchema = new Schema<IProblemExample>(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    input: {
      type: String,
      required: true,
      trim: true,
    },
    output: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

export const ProblemExample = mongoose.model<IProblemExample>(
  "ProblemExample",
  ProblemExampleSchema
);
