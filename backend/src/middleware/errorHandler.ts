import { Request, Response, NextFunction } from 'express';
import { AppError, HTTP_STATUS, ERROR_MESSAGES } from '@joch/shared';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('❌ Error:', err);

  // Zod Validation Error
  if (err instanceof ZodError || err.name === 'ZodError') {
    const errors = (err as ZodError).errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: errors,
    });
  }

  // App Error (Custom)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Mongoose Duplicate Key Error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      error: `${field} existiert bereits`,
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: errors,
    });
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Ungültige ID',
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_INVALID,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_EXPIRED,
    });
  }

  // Default Error
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: ERROR_MESSAGES.SERVER_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 Handler
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: ERROR_MESSAGES.NOT_FOUND,
  });
};
