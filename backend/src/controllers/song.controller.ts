import { Request, Response, NextFunction } from 'express';
import { SongModel } from '../models';
import {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  createSongSchema,
  updateSongSchema,
} from '@joch/shared';

/**
 * Get all songs (sorted by order)
 * @route GET /api/songs
 * @access Public
 */
export const getAllSongs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const songs = await SongModel.find().sort({ order: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: songs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single song by ID
 * @route GET /api/songs/:id
 * @access Public
 */
export const getSongById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const song = await SongModel.findById(req.params.id);

    if (!song) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.SONG_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new song
 * @route POST /api/songs
 * @access Private (Admin/Member)
 */
export const createSong = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createSongSchema.parse(req.body);

    const song = await SongModel.create(validatedData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update song
 * @route PUT /api/songs/:id
 * @access Private (Admin/Member)
 */
export const updateSong = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = updateSongSchema.parse(req.body);

    const song = await SongModel.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!song) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.SONG_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete song
 * @route DELETE /api/songs/:id
 * @access Private (Admin/Member)
 */
export const deleteSong = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const song = await SongModel.findByIdAndDelete(req.params.id);

    if (!song) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.SONG_NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};
