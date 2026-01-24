import mongoose, { Schema, Document, Types } from "mongoose";

export interface IContest extends Document {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    problems: Types.ObjectId[];
    createdBy: Types.ObjectId;
    isRated: boolean;
    status: "draft" | "published";
    registrationDeadline?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const contestSchema = new Schema<IContest>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        registrationDeadline: { type: Date },
        problems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isRated: { type: Boolean, default: false },
        status: { type: String, enum: ["draft", "published"], default: "draft" },
    },
    { timestamps: true }
);

export const Contest = mongoose.model<IContest>("Contest", contestSchema);
