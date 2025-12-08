

import { Schema, model, Document, Types } from "mongoose";
import { Verdict } from "./verdict";
import { SubmissionStatus } from "./SubmissionStatus";
import { SupportedLanguage } from "./Language";
import { TestcaseResultSchema, ITestcaseResult } from "./TestcaseResult";

export interface ISubmission extends Document {
  user: Types.ObjectId;
  problem: Types.ObjectId;
  contest?: Types.ObjectId;

  code: string;
  language: SupportedLanguage;

  verdict: Verdict;
  status: SubmissionStatus;

  totalRuntime?: number;
  totalMemory?: number;

  testcaseResults: ITestcaseResult[];

  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    contest: { type: Schema.Types.ObjectId, ref: "Contest", default: null },

    code: { type: String, required: true },

    language: {
      type: String,
      enum: Object.values(SupportedLanguage),
      required: true,
    },

    verdict: {
      type: String,
      enum: Object.values(Verdict),
      default: Verdict.COMPILE_ERROR,
    },

    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.QUEUED,
    },

    totalRuntime: { type: Number },
    totalMemory: { type: Number },

    testcaseResults: {
      type: [TestcaseResultSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default model<ISubmission>("Submission", SubmissionSchema);
