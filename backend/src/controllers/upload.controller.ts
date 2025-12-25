import { Request, Response, NextFunction } from 'express';
import { AppError, HTTP_STATUS } from '@joch/shared';
import fs from 'fs';
import path from 'path';

/**
 * Get the base URL for uploaded files
 * In production, this will be the server URL
 * In development, it defaults to localhost
 */
const getBaseUrl = (): string => {
  return process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
};

/**
 * Convert local file path to public URL
 */
const getPublicUrl = (filePath: string): string => {
  // Convert backslashes to forward slashes and make path relative
  const relativePath = filePath.replace(/\\/g, '/');
  return `${getBaseUrl()}/${relativePath}`;
};

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

    // File is already saved by multer - just return the URL
    const fileUrl = getPublicUrl(req.file.path);
    const fileStats = fs.statSync(req.file.path);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Bild erfolgreich hochgeladen',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: fileStats.size,
        url: fileUrl,
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

    // Files are already saved by multer - just return the URLs
    const files = req.files.map((file) => {
      const fileUrl = getPublicUrl(file.path);
      const fileStats = fs.statSync(file.path);

      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: fileStats.size,
        url: fileUrl,
        // Thumbnail URL is the same - frontend handles sizing via CSS
        thumbnailUrl: fileUrl,
      };
    });

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

    // File is already saved by multer - just return the URL
    const fileUrl = getPublicUrl(req.file.path);
    const fileStats = fs.statSync(req.file.path);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Audio-Datei erfolgreich hochgeladen',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: fileStats.size,
        url: fileUrl,
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
