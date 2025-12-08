import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemBoilerplate extends Document {
  problem: Types.ObjectId;
  language: string;
  template: string;
}

const problemBoilerplateSchema = new Schema<IProblemBoilerplate>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },

    language: { type: String, required: true },
    template: { type: String, required: true },
  },
  { timestamps: true }
);


export const ProblemBoilerplate = mongoose.model<IProblemBoilerplate>(
  "ProblemBoilerplate",
  problemBoilerplateSchema
);
