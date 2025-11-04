import { Request, Response, NextFunction } from 'express';
import { GalleryImageModel } from '../models';
import {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  createGalleryImageSchema,
  updateGalleryImageSchema,
} from '@joch/shared';

/**
 * Get all gallery images (with optional category filter)
 * @route GET /api/gallery?category=live
 * @access Public
 */
export const getAllGalleryImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.query;

    const filter: any = {};
    if (category && typeof category === 'string') {
      filter.category = category;
    }

    const images = await GalleryImageModel.find(filter).sort({ order: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single gallery image by ID
 * @route GET /api/gallery/:id
 * @access Public
 */
export const getGalleryImageById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const image = await GalleryImageModel.findById(req.params.id);

    if (!image) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.IMAGE_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new gallery image
 * @route POST /api/gallery
 * @access Private (Admin/Member)
 */
export const createGalleryImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createGalleryImageSchema.parse(req.body);

    const image = await GalleryImageModel.create(validatedData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update gallery image
 * @route PUT /api/gallery/:id
 * @access Private (Admin/Member)
 */
export const updateGalleryImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = updateGalleryImageSchema.parse(req.body);

    const image = await GalleryImageModel.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!image) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.IMAGE_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete gallery image
 * @route DELETE /api/gallery/:id
 * @access Private (Admin/Member)
 */
export const deleteGalleryImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const image = await GalleryImageModel.findByIdAndDelete(req.params.id);

    if (!image) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.IMAGE_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
