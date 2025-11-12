// ============================================
// JOCH Bandpage - Guestbook Entry Model
// ============================================

import mongoose, { Schema, Document } from 'mongoose';
import type { GuestbookEntry as IGuestbookEntry } from '@joch/shared';

/**
 * Guestbook Entry Document Interface
 */
export interface GuestbookEntryDocument
  extends Omit<IGuestbookEntry, '_id'>,
    Document {}

/**
 * Guestbook Entry Schema
 */
const guestbookEntrySchema = new Schema<GuestbookEntryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name ist erforderlich'],
      trim: true,
      minlength: [2, 'Name muss mindestens 2 Zeichen lang sein'],
      maxlength: [100, 'Name darf maximal 100 Zeichen lang sein'],
    },
    email: {
      type: String,
      required: [true, 'Email ist erforderlich'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Bitte eine gültige Email-Adresse eingeben',
      ],
      maxlength: [255, 'Email darf maximal 255 Zeichen lang sein'],
    },
    message: {
      type: String,
      required: [true, 'Nachricht ist erforderlich'],
      trim: true,
      minlength: [10, 'Nachricht muss mindestens 10 Zeichen lang sein'],
      maxlength: [1000, 'Nachricht darf maximal 1000 Zeichen lang sein'],
    },
  },
  {
    timestamps: true, // Auto createdAt & updatedAt
    collection: 'guestbook_entries',
  }
);

// Indexes
guestbookEntrySchema.index({ createdAt: -1 }); // Sort by newest first

/**
 * Guestbook Entry Model
 */
export const GuestbookEntryModel = mongoose.model<GuestbookEntryDocument>(
  'GuestbookEntry',
  guestbookEntrySchema
);
