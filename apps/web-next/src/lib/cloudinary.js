import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file (Buffer or base64 data URI) to Cloudinary.
 * Used server-side only (admin upload API route) -- the API secret never
 * reaches the browser.
 */
export async function uploadImage(fileDataUri, folder = "quicktrails") {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
