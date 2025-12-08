import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemCompanyTag extends Document {
  problem: Types.ObjectId;
  company: string;
}

const problemCompanyTagSchema = new Schema<IProblemCompanyTag>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    company: { type: String, required: true },
  },
  { timestamps: true }
);



export const ProblemCompanyTag = mongoose.model<IProblemCompanyTag>(
  "ProblemCompanyTag",
  problemCompanyTagSchema
);
