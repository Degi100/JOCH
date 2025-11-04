import mongoose, { Schema, Document } from 'mongoose';
import type { GalleryImage as IGalleryImage } from '@joch/shared';

export interface GalleryImageDocument extends Omit<IGalleryImage, '_id'>, Document {}

const galleryImageSchema = new Schema<GalleryImageDocument>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Titel darf maximal 200 Zeichen lang sein'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Beschreibung darf maximal 500 Zeichen lang sein'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Bild-URL ist erforderlich'],
    },
    thumbnailUrl: {
      type: String,
    },
    category: {
      type: String,
      enum: ['live', 'promo', 'backstage', 'other'],
      default: 'other',
    },
    order: {
      type: Number,
      required: [true, 'Reihenfolge ist erforderlich'],
      min: [0, 'Reihenfolge muss mindestens 0 sein'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for category filtering and sorting by order
galleryImageSchema.index({ category: 1, order: 1 });

export const GalleryImageModel = mongoose.model<GalleryImageDocument>(
  'GalleryImage',
  galleryImageSchema
);
