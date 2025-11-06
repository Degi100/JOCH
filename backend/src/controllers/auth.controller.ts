import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models';
import { generateToken } from '../config/jwt';
import {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  loginSchema,
  createUserSchema,
} from '@joch/shared';

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, ERROR_MESSAGES.USER_EXISTS);
    }

    // Create user (password will be auto-hashed by pre-save hook)
    const user = await UserModel.create(validatedData);

    // Generate JWT token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user (include password for comparison)
    const user = await UserModel.findOne({ email: validatedData.email }).select(
      '+password'
    );

    if (!user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user (requires authentication)
export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users.map((user) => ({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['admin', 'member', 'user'].includes(role)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Ungültige Rolle');
    }

    // Prevent admin from changing their own role
    if (req.user?.userId === userId) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'Du kannst deine eigene Rolle nicht ändern'
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Benutzerrolle erfolgreich aktualisiert',
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
