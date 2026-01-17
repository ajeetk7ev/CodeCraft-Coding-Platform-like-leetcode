import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemTestcase extends Document {
  problem: Types.ObjectId;
  input?: string;
  output?: string;
  isHidden: boolean;
}

const problemTestcaseSchema = new Schema<IProblemTestcase>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },

    input: { type: String },
    output: { type: String },

    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);



export const ProblemTestcase = mongoose.model<IProblemTestcase>(
  "ProblemTestcase",
  problemTestcaseSchema
);
