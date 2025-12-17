import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemBoilerplate extends Document {
  problem: Types.ObjectId;
  language: string;

  // Code shown to user (ONLY function)
  userCodeTemplate: string;

  // Hidden boilerplate (imports + main + test runner)
  fullCodeTemplate: string;
}

const problemBoilerplateSchema = new Schema<IProblemBoilerplate>(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    language: {
      type: String,
      required: true,
      enum: ["cpp", "java", "python", "javascript"],
    },

    userCodeTemplate: {
      type: String,
      required: true,
    },

    fullCodeTemplate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


export const ProblemBoilerplate = mongoose.model<IProblemBoilerplate>(
  "ProblemBoilerplate",
  problemBoilerplateSchema
);
