import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user/User";
import { logger } from "../utils/logger";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

interface DecodedToken extends JwtPayload {
  id: string;
}

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized, token missing", 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Fetch user and attach to req
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 401));
    }

    // Attach user to req for further usage
    (req as any).user = user;

    next();
  },
);

export const optionalProtect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next();
    }

    // Verify token
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!,
      ) as DecodedToken;
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        (req as any).user = user;
      } else {
        logger.error(`User not found for decoded ID: ${decoded.id}`);
      }
    } catch (err) {
      // Token invalid or expired, just proceed as guest
      logger.error("Optional auth token invalid:", err);
    }

    next();
  },
);
