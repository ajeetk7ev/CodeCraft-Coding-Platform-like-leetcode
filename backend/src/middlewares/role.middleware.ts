import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export const isAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;

    if (!role) {
      return next(new AppError("Not authorized, no role found", 401));
    }

    if (role !== "admin") {
      return next(
        new AppError(
          `Role '${role}' is not authorized to access this resource`,
          403,
        ),
      );
    }

    next();
  },
);
