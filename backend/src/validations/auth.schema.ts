import { z } from "zod";

export const signupSchema = z.object({
  fullName:z
  .string("FullName is requried")
  .min(3,"FullName must be at least 3 characters ")
  .max(20),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, underscores"),

  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
