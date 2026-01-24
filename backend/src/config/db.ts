import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info("DB Connected Successfully!");
  } catch (error) {
    logger.error("Failed to Connect DB", error);
    process.exit(1);
  }
};
