import { Request, Response, NextFunction } from 'express';
import { BandMemberModel } from '../models';
import {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  createBandMemberSchema,
  updateBandMemberSchema,
} from '@joch/shared';

// Get all band members (sorted by order)
export const getAllBandMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const members = await BandMemberModel.find().sort({ order: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// Get band member by ID
export const getBandMemberById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await BandMemberModel.findById(req.params.id);

    if (!member) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.BAND_MEMBER_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Create band member (Admin only)
export const createBandMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createBandMemberSchema.parse(req.body);

    const member = await BandMemberModel.create(validatedData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Update band member (Admin only)
export const updateBandMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = updateBandMemberSchema.parse(req.body);

    const member = await BandMemberModel.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!member) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.BAND_MEMBER_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Delete band member (Admin only)
export const deleteBandMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await BandMemberModel.findByIdAndDelete(req.params.id);

    if (!member) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.BAND_MEMBER_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
