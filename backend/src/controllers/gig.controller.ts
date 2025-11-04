import { Request, Response, NextFunction } from 'express';
import { GigModel } from '../models';
import {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  createGigSchema,
  updateGigSchema,
  gigFilterSchema,
  PAGINATION,
} from '@joch/shared';

// Get all gigs (with filters and pagination)
export const getAllGigs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedQuery = gigFilterSchema.parse(req.query);
    const { page, limit, status, fromDate, toDate } = validatedQuery;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [gigs, total] = await Promise.all([
      GigModel.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      GigModel.countDocuments(filter),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: gigs,
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

// Get upcoming gigs
export const getUpcomingGigs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gigs = await GigModel.find({ status: 'upcoming' }).sort({ date: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: gigs,
    });
  } catch (error) {
    next(error);
  }
};

// Get gig by ID
export const getGigById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gig = await GigModel.findById(req.params.id);

    if (!gig) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.GIG_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

// Create gig (Admin only)
export const createGig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createGigSchema.parse(req.body);

    const gig = await GigModel.create(validatedData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

// Update gig (Admin only)
export const updateGig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = updateGigSchema.parse(req.body);

    const gig = await GigModel.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!gig) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.GIG_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

// Delete gig (Admin only)
export const deleteGig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gig = await GigModel.findByIdAndDelete(req.params.id);

    if (!gig) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.GIG_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
