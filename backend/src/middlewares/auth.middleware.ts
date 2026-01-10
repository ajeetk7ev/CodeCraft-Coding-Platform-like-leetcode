import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user/User";

interface DecodedToken extends JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Fetch user and attach to req
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to req for further usage
    (req as any).user = user;

    next();
  } catch (error) {
    console.log("Error in protect middleware ", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const optionalProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        (req as any).user = user;
      } else {
        console.log("User not found for decoded ID:", decoded.id);
      }
    } catch (err) {
      // Token invalid or expired, just proceed as guest
      console.log("Optional auth token invalid:", err);
    }

    next();
  } catch (error) {
    console.log("Error in optionalProtect middleware ", error);
    next();
  }
};