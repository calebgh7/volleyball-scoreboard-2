import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { env } from './env-validation';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export interface DeleteResult {
  success: boolean;
  message: string;
}

// Upload image to Cloudinary
export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = 'volleyscore',
  options: {
    transformation?: any[];
    publicId?: string;
  } = {}
): Promise<UploadResult> => {
  try {
    // Convert buffer to stream
    const stream = Readable.from(fileBuffer);
    
    // Upload to Cloudinary
    const result = await new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: options.publicId,
          transformation: options.transformation || [
            { width: 512, height: 512, crop: 'limit' }, // Limit size
            { quality: 'auto:good' }, // Optimize quality
            { format: 'auto' } // Auto-format
          ],
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );
      
      stream.pipe(uploadStream);
    });

    console.log(`✅ Image uploaded successfully: ${result.url}`);
    return result;
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<DeleteResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`✅ Image deleted successfully: ${publicId}`);
      return { success: true, message: 'Image deleted successfully' };
    } else {
      console.warn(`⚠️ Image deletion warning: ${publicId} - ${result.result}`);
      return { success: false, message: `Deletion warning: ${result.result}` };
    }
  } catch (error) {
    console.error('❌ Image deletion failed:', error);
    return { 
      success: false, 
      message: `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string => {
  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  const transformationString = transformations.length > 0 ? transformations.join(',') : '';
  
  return cloudinary.url(publicId, {
    transformation: transformationString,
    secure: true,
  });
};

// Check if Cloudinary is configured
export const isCloudinaryConfigured = (): boolean => {
  return !!(env.CLOUDINARY_CLOUD_NAME && 
           env.CLOUDINARY_API_KEY && 
           env.CLOUDINARY_API_SECRET);
};

// Fallback to local storage if Cloudinary is not configured
export const getStorageMode = (): 'cloud' | 'local' => {
  return isCloudinaryConfigured() ? 'cloud' : 'local';
};
