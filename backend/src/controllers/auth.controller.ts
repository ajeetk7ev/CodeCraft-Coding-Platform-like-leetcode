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
        new AppError("Invalid identification parameters provided.", 400),
      );
    }

    const { fullName, username, email, password } = parsed.data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(
        new AppError(
          "Identity conflict: email or username already indexed in the grid.",
          400,
        ),
      );
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
      message:
        "Identity verified and indexed. Access protocol initialized: Please finalize via login.",
    });
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError("Invalid identification parameters provided.", 400),
      );
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user)
      return next(
        new AppError("Access denied: Identity not found in the grid.", 404),
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return next(
        new AppError(
          "Authentication failed: Invalid credentials protocol.",
          401,
        ),
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
