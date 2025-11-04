import { Request, Response, NextFunction } from 'express';
import { NewsPostModel } from '../models';
import {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  createNewsPostSchema,
  updateNewsPostSchema,
  newsFilterSchema,
} from '@joch/shared';

// Get all news posts (with filters and pagination)
export const getAllNews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedQuery = newsFilterSchema.parse(req.query);
    const { page, limit, published } = validatedQuery;

    // Build filter
    const filter: any = {};
    if (published !== undefined) filter.published = published;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [news, total] = await Promise.all([
      NewsPostModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'email role'),
      NewsPostModel.countDocuments(filter),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: news,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get published news posts (public)
export const getPublishedNews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const news = await NewsPostModel.find({ published: true })
      .sort({ publishedAt: -1 })
      .populate('author', 'email role');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Get news post by ID
export const getNewsById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const news = await NewsPostModel.findById(req.params.id).populate(
      'author',
      'email role'
    );

    if (!news) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NEWS_POST_NOT_FOUND);
    }

    // If not published, require authentication
    if (!news.published && !req.user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Create news post (Admin only)
export const createNews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createNewsPostSchema.parse(req.body);

    if (!req.user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const news = await NewsPostModel.create({
      ...validatedData,
      author: req.user.userId,
    });

    const populatedNews = await news.populate('author', 'email role');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: populatedNews,
    });
  } catch (error) {
    next(error);
  }
};

// Update news post (Admin only)
export const updateNews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = updateNewsPostSchema.parse(req.body);

    const news = await NewsPostModel.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('author', 'email role');

    if (!news) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NEWS_POST_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Delete news post (Admin only)
export const deleteNews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const news = await NewsPostModel.findByIdAndDelete(req.params.id);

    if (!news) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NEWS_POST_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
