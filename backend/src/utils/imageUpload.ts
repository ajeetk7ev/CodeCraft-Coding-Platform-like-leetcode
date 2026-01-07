import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

const uploadImageToCloudinary = async (
  file: any,             
  folder: string,
  height?: number,
  quality?: number
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
  const options: {
    folder: string;
    height?: number;
    quality?: number;
    resource_type: "auto";
  } = {
    folder,
    resource_type: "auto",
  };

  if (height) {
    options.height = height;
  }

  if (quality) {
    options.quality = quality;
  }

  // Handle both disk storage (with path) and memory storage (with buffer)
  if (file.buffer) {
    // Memory storage - upload buffer directly
    const uploadOptions = { ...options, resource_type: "auto" as const };
    return await cloudinary.uploader.upload(`data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`, uploadOptions);
  } else if (file.path) {
    // Disk storage - upload from file path
    return await cloudinary.uploader.upload(file.path, options);
  } else {
    throw new Error('Invalid file object: no buffer or path provided');
  }
};

export default uploadImageToCloudinary;