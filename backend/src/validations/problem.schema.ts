import { z } from "zod";

// Schema for problem examples
const exampleSchema = z.object({
  input: z.string().min(1, "Input is required").optional(),
  output: z.string().min(1, "Output is required").optional(),
  explanation: z.string().optional(),
});

// Schema for testcases
const testcaseSchema = z.object({
  input: z.string().min(1, "Input is required").optional(),
  output: z.string().min(1, "Output is required").optional(),
  isHidden: z.boolean().default(false),
});

// Schema for boilerplates
const boilerplateSchema = z.object({
  language: z.string().min(1, "Language is required"),
  userCodeTemplate: z.string().min(1, "UserCodeTemplate is required"),
  fullCodeTemplate: z.string().min(1, "FullCodeTemplate is required"),
});

export const createProblemSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug must be at most 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  // Description and constraints
  description: z.string().min(10, "Description must be at least 10 characters"),
  constraints: z.array(z.string()).min(1, "At least one constraint is required").optional(),
  // Examples
  examples: z.array(exampleSchema).min(1, "At least one example is required").optional(),
  // Testcases
  testcases: z.array(testcaseSchema).min(1, "At least one testcase is required"),
  // Boilerplates
  boilerplates: z.array(boilerplateSchema).optional(),
  // Tags
  tags: z.array(z.string()).optional(),
  // Company tags
  companyTags: z.array(z.string()).optional(),
});

export const updateProblemSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug must be at most 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  // Description and constraints
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  constraints: z.array(z.string()).optional(),
  // Examples
  examples: z.array(exampleSchema).optional(),
  // Testcases
  testcases: z.array(testcaseSchema).optional(),
  // Boilerplates
  boilerplates: z.array(boilerplateSchema).optional(),
  // Tags
  tags: z.array(z.string()).optional(),
  // Company tags
  companyTags: z.array(z.string()).optional(),
});

