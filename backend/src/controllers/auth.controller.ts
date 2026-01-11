import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user/User";
import { signupSchema, loginSchema } from "../validations/auth.schema";
import { generateToken } from "../utils/generateToken";
import { updateUserStreak } from "../utils/streak.utils";


export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const { fullName, username, email, password } = parsed.data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email or Username already exists" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPass,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        gender: user.gender,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
      },
      token,
    });
  } catch (error) {
    console.log("Error in signup", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Update user streak
    const updatedUser = await updateUserStreak((user._id as string).toString());

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        currentStreak: updatedUser.currentStreak,
        longestStreak: updatedUser.longestStreak,
        gender: updatedUser.gender,
        bio: updatedUser.bio,
        github: updatedUser.github,
        linkedin: updatedUser.linkedin,
      },
      token,
    });
  } catch (error) {
    console.log("Error in login", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
