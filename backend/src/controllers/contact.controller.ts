import { Request, Response, NextFunction } from 'express';
import { ContactMessageModel } from '../models';
import {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  createContactMessageSchema,
} from '@joch/shared';

/**
 * Get all contact messages (Admin only)
 * @route GET /api/contact?read=false
 * @access Private (Admin)
 */
export const getAllContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { read } = req.query;

    const filter: any = {};
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const messages = await ContactMessageModel.find(filter).sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single contact message by ID (Admin only)
 * @route GET /api/contact/:id
 * @access Private (Admin)
 */
export const getContactMessageById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await ContactMessageModel.findById(req.params.id);

    if (!message) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.MESSAGE_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new contact message (Public)
 * @route POST /api/contact
 * @access Public
 */
export const createContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createContactMessageSchema.parse(req.body);

    const message = await ContactMessageModel.create(validatedData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_SENT,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read/unread (Admin only)
 * @route PATCH /api/contact/:id/read
 * @access Private (Admin)
 */
export const markMessageAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { read } = req.body;

    if (typeof read !== 'boolean') {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Field "read" must be a boolean');
    }

    const message = await ContactMessageModel.findByIdAndUpdate(
      req.params.id,
      { read },
      { new: true, runValidators: true }
    );

    if (!message) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.MESSAGE_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: read ? 'Nachricht als gelesen markiert' : 'Nachricht als ungelesen markiert',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete contact message (Admin only)
 * @route DELETE /api/contact/:id
 * @access Private (Admin)
 */
export const deleteContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await ContactMessageModel.findByIdAndDelete(req.params.id);

    if (!message) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.MESSAGE_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
