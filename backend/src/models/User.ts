import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password: string;

  gender?: "male" | "female" | "other";
  github?: string;
  linkedin?: string;
  avatar?: string;
  bio?: string;

  role: "user" | "admin";

  emailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    github: String,
    linkedin: String,
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);


export const User = mongoose.model<IUser>("User", userSchema);
