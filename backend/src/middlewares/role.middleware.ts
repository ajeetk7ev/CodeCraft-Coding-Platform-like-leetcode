import { Request, Response, NextFunction } from "express";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = (req as any).user?.role;

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no role found",
      });
    }

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: `Role '${role}' is not authorized to access this resource`,
      });
    }

    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}