import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user/User";
import { signupSchema, loginSchema } from "../validations/auth.schema";
import { generateToken } from "../utils/generateToken";


export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const {fullName, username, email, password } = parsed.data;

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
      user: { id: user._id, username: user.username, email: user.email },
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
    if (!user) return res.status(404).json({success:false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({success:false, message: "Invalid credentials" });

    const token = generateToken(user._id);

    return res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    console.log("Error in login", err);
    return res.status(500).json({success:false, message: "Server error" });
  }
};
