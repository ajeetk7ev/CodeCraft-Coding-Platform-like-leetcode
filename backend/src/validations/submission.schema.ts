import { z } from "zod";
import { SupportedLanguage } from "../models/submission/Language";

export const runCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.nativeEnum(SupportedLanguage, {
    errorMap: () => ({ message: "Invalid language" }),
  }),
  stdin: z.string().optional(),
  expectedOutput: z.string().optional(),
});

export const submitCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.nativeEnum(SupportedLanguage, {
    errorMap: () => ({ message: "Invalid language" }),
  }),
  problemId: z.string().min(1, "Problem ID is required"),
  contestId: z.string().optional(),
});

