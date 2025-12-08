import jwt from "jsonwebtoken";

export const generateToken = (userId: any) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};
