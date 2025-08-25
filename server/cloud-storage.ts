import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  size: number;
  width: number;
  height: number;
}

export interface CloudStorageConfig {
  folder?: string;
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  };
}

export class CloudStorageService {
  private defaultConfig: CloudStorageConfig = {
    folder: 'volleyscore',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    transformation: {
      quality: 'auto',
      crop: 'limit'
    }
  };

  // Upload image from buffer
  async uploadImage(
    buffer: Buffer,
    filename: string,
    config: CloudStorageConfig = {}
  ): Promise<UploadResult> {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };
      
      // Validate file format
      const fileExtension = filename.split('.').pop()?.toLowerCase();
      if (!fileExtension || !finalConfig.allowedFormats?.includes(fileExtension)) {
        throw new Error(`Invalid file format. Allowed formats: ${finalConfig.allowedFormats?.join(', ')}`);
      }

      // Validate file size
      if (buffer.length > (finalConfig.maxFileSize || 0)) {
        throw new Error(`File too large. Maximum size: ${Math.round((finalConfig.maxFileSize || 0) / 1024 / 1024)}MB`);
      }

      // Create upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: finalConfig.folder,
          transformation: finalConfig.transformation,
          resource_type: 'image',
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            throw new Error(`Upload failed: ${error.message}`);
          }
        }
      );

      // Convert buffer to stream and upload
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);

      // Wait for upload to complete
      return new Promise((resolve, reject) => {
        uploadStream.on('finish', (result: any) => {
          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
          });
        });

        uploadStream.on('error', (error) => {
          reject(new Error(`Upload stream error: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('Cloud storage upload failed:', error);
      throw error;
    }
  }

  // Upload image from base64 string
  async uploadImageFromBase64(
    base64Data: string,
    filename: string,
    config: CloudStorageConfig = {}
  ): Promise<UploadResult> {
    try {
      // Remove data URL prefix if present
      const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64String, 'base64');
      
      return await this.uploadImage(buffer, filename, config);
    } catch (error) {
      console.error('Base64 upload failed:', error);
      throw error;
    }
  }

  // Delete image by public ID
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log(`✅ Image deleted successfully: ${publicId}`);
        return true;
      } else {
        console.warn(`⚠️ Image deletion result: ${result.result}`);
        return false;
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }

  // Get image info by public ID
  async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Failed to get image info:', error);
      throw error;
    }
  }

  // Generate optimized URL for image
  generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: number;
      format?: string;
    } = {}
  ): string {
    try {
      const transformation = {
        width: options.width,
        height: options.height,
        crop: options.crop || 'limit',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
      };

      // Remove undefined values
      Object.keys(transformation).forEach(key => 
        transformation[key] === undefined && delete transformation[key]
      );

      return cloudinary.url(publicId, {
        transformation: [transformation],
        secure: true,
      });
    } catch (error) {
      console.error('Failed to generate optimized URL:', error);
      // Fallback to original URL
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
    }
  }

  // Generate thumbnail URL
  generateThumbnailUrl(publicId: string, size: number = 150): string {
    return this.generateOptimizedUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto',
    });
  }

  // Check if Cloudinary is configured
  isConfigured(): boolean {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && 
              process.env.CLOUDINARY_API_KEY && 
              process.env.CLOUDINARY_API_SECRET);
  }

  // Get storage usage info
  async getStorageUsage(): Promise<any> {
    try {
      const result = await cloudinary.api.usage();
      return {
        plan: result.plan,
        credits: result.credits,
        objects: result.objects,
        bandwidth: result.bandwidth,
        storage: result.storage,
        requests: result.requests,
        resources: result.resources,
        derived_resources: result.derived_resources,
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      throw error;
    }
  }
}

export const cloudStorage = new CloudStorageService();
