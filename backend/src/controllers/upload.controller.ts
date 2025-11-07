import { Request, Response, NextFunction } from 'express';
import { AppError, HTTP_STATUS } from '@joch/shared';
import { uploadToCloudinary } from '../config';
import fs from 'fs';

/**
 * Upload single image
 * @route POST /api/upload/image
 * @access Private (Admin/Member)
 */
export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Keine Datei hochgeladen');
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.path,
      'images'
    );

    // Delete local file after successful upload
    fs.unlinkSync(req.file.path);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Bild erfolgreich hochgeladen',
      data: {
        filename: cloudinaryResult.publicId,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: cloudinaryResult.size,
        url: cloudinaryResult.url,
      },
    });
  } catch (error) {
    // Clean up local file on error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to delete temp file:', cleanupError);
      }
    }
    next(error);
  }
};

/**
 * Upload multiple images
 * @route POST /api/upload/images
 * @access Private (Admin/Member)
 */
export const uploadMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const uploadedFiles: Express.Multer.File[] = [];

  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Keine Dateien hochgeladen');
    }

    uploadedFiles.push(...req.files);

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.path, 'gallery');

      // Delete local file after upload
      fs.unlinkSync(file.path);

      return {
        filename: result.publicId,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: result.size,
        url: result.url,
      };
    });

    const files = await Promise.all(uploadPromises);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: `${files.length} Bilder erfolgreich hochgeladen`,
      data: files,
    });
  } catch (error) {
    // Clean up local files on error
    uploadedFiles.forEach((file) => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        console.error('Failed to delete temp file:', cleanupError);
      }
    });
    next(error);
  }
};

/**
 * Upload single audio file
 * @route POST /api/upload/audio
 * @access Private (Admin/Member)
 */
export const uploadSingleAudio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Keine Datei hochgeladen');
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.path,
      'audio'
    );

    // Delete local file after successful upload
    fs.unlinkSync(req.file.path);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Audio-Datei erfolgreich hochgeladen',
      data: {
        filename: cloudinaryResult.publicId,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: cloudinaryResult.size,
        url: cloudinaryResult.url,
      },
    });
  } catch (error) {
    // Clean up local file on error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to delete temp file:', cleanupError);
      }
    }
    next(error);
  }
};
