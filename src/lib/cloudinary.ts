import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: 'image' | 'video' | 'raw';
}

export class CloudinaryService {
  /**
   * Upload an image to Cloudinary
   */
  static async uploadImage(
    file: Buffer | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'gbhs-bafia',
        transformation: options.transformation || {
          quality: 'auto',
          fetch_format: 'auto',
        },
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        resource_type: options.resource_type || 'image',
      };

      const result = await cloudinary.uploader.upload(
        file as string,
        uploadOptions
      );

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
      };
    } catch (error) {
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  static async uploadMultipleImages(
    files: (Buffer | string)[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
      crop?: string;
    } = {}
  ): string {
    const transformation = {
      width: options.width,
      height: options.height,
      quality: options.quality || 'auto',
      fetch_format: options.format || 'auto',
      crop: options.crop || 'fill',
    };

    return cloudinary.url(publicId, {
      transformation: [transformation],
      secure: true,
    });
  }

  /**
   * Generate thumbnail URL
   */
  static getThumbnailUrl(
    publicId: string,
    width: number = 300,
    height: number = 200
  ): string {
    return this.getOptimizedUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
    });
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  static getResponsiveUrls(publicId: string): {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  } {
    return {
      sm: this.getOptimizedUrl(publicId, { width: 640, height: 480 }),
      md: this.getOptimizedUrl(publicId, { width: 768, height: 576 }),
      lg: this.getOptimizedUrl(publicId, { width: 1024, height: 768 }),
      xl: this.getOptimizedUrl(publicId, { width: 1280, height: 960 }),
    };
  }
}

export default cloudinary;
