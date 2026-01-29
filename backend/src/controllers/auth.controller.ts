import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import bcrypt from "bcryptjs";
import { User } from "../models/user/User";
import { signupSchema, loginSchema } from "../validations/auth.schema";
import { generateToken } from "../utils/generateToken";
import { checkAndResetStreak } from "../utils/streak.utils";
import { AppError } from "../utils/AppError";

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError(
          "Invalid identification parameters provided.",
          400,
          parsed.error.flatten().fieldErrors,
        ),
      );
    }

    const { fullName, username, email, password } = parsed.data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new AppError("Email or Username already exists.", 400));
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      username,
      email,
      password: hashedPass,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Please login.",
    });
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError(
          "All fields are required",
          400,
          parsed.error.flatten().fieldErrors,
        ),
      );
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user)
      return next(new AppError("Access denied: Identity not found", 404));

    if (!user.password) {
      return next(
        new AppError("Authentication failed:  Please login with Google.", 401),
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return next(
        new AppError("Authentication failed: Invalid credentials.", 401),
      );

    // Check and Reset user streak if day missed
    const checkResult = await checkAndResetStreak(
      (user._id as string).toString(),
    );
    const updatedUser = checkResult || user;

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Authentication successful. Access granted.",
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
  },
);

export const googleCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) {
      return next(new AppError("Authentication failed", 401));
    }

    const token = generateToken(user._id);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth-success?token=${token}`);
  },
);
