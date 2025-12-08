
import { Schema } from "mongoose";

export interface ITestcaseResult {
  input?: string;
  expectedOutput?: string;
  userOutput?: string;
  passed: boolean;
  runtime?: number;
  memory?: number;
}

export const TestcaseResultSchema = new Schema<ITestcaseResult>({
  input: { type: String },
  expectedOutput: { type: String },
  userOutput: { type: String },
  passed: { type: Boolean, required: true },
  runtime: { type: Number },
  memory: { type: Number },
});
