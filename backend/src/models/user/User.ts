import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  googleId?: string;

  gender?: "male" | "female" | "other";
  github?: string;
  linkedin?: string;
  avatar?: string;
  bio?: string;

  role: "user" | "admin";
  rating: number;
  lastActivityDate: Date;
  banned: boolean;

  emailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;

  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  lastActivity?: Date;

  ratingHistory?: {
    rating: number;
    date: Date;
    contestId?: any;
  }[];
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
    password: {
      type: String,
      required: function (this: any) {
        return !this.googleId;
      },
    },
    googleId: { type: String, unique: true, sparse: true },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    github: String,
    linkedin: String,
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" }, // Kept this line
    role: { type: String, enum: ["user", "admin"], default: "user" },
    rating: { type: Number, default: 1500 }, // Added this line
    lastActivityDate: { type: Date, default: Date.now }, // Added this line
    banned: { type: Boolean, default: false }, // Kept this line

    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Streak tracking
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivity: Date,

    ratingHistory: [
      {
        rating: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        contestId: { type: Schema.Types.ObjectId, ref: "Contest" },
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
