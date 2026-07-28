import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadToCloudinary(
  file: Buffer,
  options?: {
    folder?: string;
    filename?: string;
    transformation?: object[];
  }
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
  format: string;
}> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options?.folder ?? 'resmiin',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto' as const,
      format: 'webp',
      quality: 'auto:good',
      ...(options?.transformation && { transformation: options.transformation }),
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      if (!result) {
        reject(new Error('Upload failed: no result returned'));
        return;
      }
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
      });
    });

    stream.end(file);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
