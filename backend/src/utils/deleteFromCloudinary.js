import { v2 as cloudinary } from "cloudinary";

export const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // You might want to handle this error differently
        throw new Error("Failed to delete old image from Cloudinary");
    }
};
       