import { v2 as cloudinary } from 'cloudinary';
import { AppError, HTTP_STATUS } from '@joch/shared';

/**
 * Cloudinary Configuration
 * Initializes Cloudinary with credentials from environment variables
 */
export const initCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
      '⚠️  Cloudinary credentials not configured. File uploads will fail.'
    );
    console.warn('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log('✅ Cloudinary configured successfully');
};

/**
 * Upload image to Cloudinary
 * @param filePath - Local file path
 * @param folder - Cloudinary folder name (e.g., 'band-members', 'gallery')
 * @returns Cloudinary upload result with secure_url
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'joch'
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `joch-band/${folder}`,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Fehler beim Hochladen des Bildes'
    );
  }
};

/**
 * Upload image with automatic thumbnail generation
 * @param filePath - Local file path
 * @param folder - Cloudinary folder name
 * @returns Object with main image URL and thumbnail URL
 */
export const uploadImageWithThumbnail = async (
  filePath: string,
  folder: string = 'gallery'
) => {
  try {
    // Upload main image
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `joch-band/${folder}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    // Generate thumbnail URL using Cloudinary transformations
    const thumbnailUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      thumbnailUrl,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Fehler beim Hochladen des Bildes'
    );
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error - deletion is not critical
  }
};

// Don't initialize on module load - let server.ts call initCloudinary() after dotenv
export { cloudinary };
