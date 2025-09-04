import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config(); 


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(filePath); 
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary error:", error);

    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return null;
  }
};

export default uploadOnCloudinary;
