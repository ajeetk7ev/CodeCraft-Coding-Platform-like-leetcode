import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblemBoilerplate extends Document {
  problem: Types.ObjectId;
  language: string;

  // Code shown to user (ONLY function)
  userTemplate: string;

  // Hidden boilerplate (imports + main + test runner)
  fullTemplate: string;
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

    userTemplate: {
      type: String,
      required: true,
    },

    fullTemplate: {
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
