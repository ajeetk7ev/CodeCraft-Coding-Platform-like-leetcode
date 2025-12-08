import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblem extends Document {
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  createdBy: Types.ObjectId;
}

const problemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);


export const Problem = mongoose.model<IProblem>("Problem", problemSchema);
