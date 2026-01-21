import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath);

    //  SAFE DELETE (NO ENOENT ERROR)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return uploadResult.secure_url;
  } catch (error) {
    //  SAFE DELETE EVEN ON ERROR
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error; // let controller handle error
  }
};

export default uploadCloudinary;