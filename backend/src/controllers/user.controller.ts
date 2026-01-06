import { Preferences } from "../models/user/Preferences";
import { Request, Response } from "express";

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fontSize } = req.body;

    if (!fontSize) {
      return res.status(400).json({
        success: false,
        message: "fontSize is required",
      });
    }

   const preferences =  await Preferences.findOneAndUpdate(
      { user: user._id },        // find by user
      { $set: { fontSize } },    // update fields
      {
        new: true,               // return updated doc
        upsert: true,            // CREATE if not exists
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Preferences saved successfully",
    });
  } catch (error) {
    console.error("Update Preferences Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
