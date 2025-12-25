import { z } from "zod";
import { SupportedLanguage } from "../models/submission/Language";

export const runCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),

  language: z.nativeEnum(SupportedLanguage),

  testcases: z.array(
    z.object({
      stdin: z.string().optional(),
      expectedOutput: z.string().optional(),
    })
  ).min(1, "At least one test case is required"),
});


export const submitCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),

  language: z.nativeEnum(SupportedLanguage).refine(
    (val) => Object.values(SupportedLanguage).includes(val),
    { message: "Invalid language" }
  ),

  problemId: z.string().min(1, "Problem ID is required"),
});
