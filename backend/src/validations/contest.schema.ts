import { z } from "zod";

export const createContestSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start time",
    }),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end time",
    }),
    problems: z.array(z.string()).min(1, "At least one problem must be selected"),
    isRated: z.boolean().optional(),
    status: z.enum(["draft", "published"]).optional(),
    registrationDeadline: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid registration deadline",
    }),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
}).refine((data) => !data.registrationDeadline || new Date(data.registrationDeadline) < new Date(data.endTime), {
    message: "Registration deadline must be before contest end time",
    path: ["registrationDeadline"],
});

export const updateContestSchema = createContestSchema.partial();
