// ============================================
// JOCH Bandpage - Guestbook Controller
// ============================================

import { Request, Response, NextFunction } from 'express';
import { GuestbookEntryModel } from '../models/GuestbookEntry.model';
import { createGuestbookEntrySchema } from '@joch/shared';

/**
 * Get all guestbook entries
 * Public route
 */
export const getAllEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const entries = await GuestbookEntryModel.find()
      .sort({ createdAt: -1 }) // Newest first
      .select('-email') // Don't expose emails publicly
      .lean();

    res.json({
      success: true,
      data: entries,
      total: entries.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all guestbook entries (with email, for admin)
 * Protected route - Admin only
 */
export const getAllEntriesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const entries = await GuestbookEntryModel.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: entries,
      total: entries.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new guestbook entry
 * Public route
 */
export const createEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validatedData = createGuestbookEntrySchema.parse(req.body);

    // Create entry
    const entry = await GuestbookEntryModel.create(validatedData);

    // Return without email
    const { email, ...entryWithoutEmail } = entry.toObject();

    res.status(201).json({
      success: true,
      message: 'Gästebuch-Eintrag erfolgreich erstellt',
      data: entryWithoutEmail,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete guestbook entry
 * Protected route - Admin/Member only
 */
export const deleteEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const entry = await GuestbookEntryModel.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Gästebuch-Eintrag nicht gefunden',
      });
    }

    res.json({
      success: true,
      message: 'Gästebuch-Eintrag erfolgreich gelöscht',
    });
  } catch (error) {
    next(error);
  }
};
