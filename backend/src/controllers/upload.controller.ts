import { Request, Response, NextFunction } from 'express';
import { AppError, HTTP_STATUS } from '@joch/shared';

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

    // Generate public URL for the uploaded file
    const fileUrl = `/uploads/images/${req.file.filename}`;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Bild erfolgreich hochgeladen',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
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
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Keine Dateien hochgeladen');
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/images/${file.filename}`,
    }));

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: `${files.length} Bilder erfolgreich hochgeladen`,
      data: files,
    });
  } catch (error) {
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

    // Generate public URL for the uploaded file
    const fileUrl = `/uploads/audio/${req.file.filename}`;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Audio-Datei erfolgreich hochgeladen',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
