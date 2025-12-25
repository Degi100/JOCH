import mongoose, { Schema, Document } from 'mongoose';
import type { SocialLink as ISocialLink } from '@joch/shared';

export interface SocialLinkDocument extends Omit<ISocialLink, '_id'>, Document {}

const socialLinkSchema = new Schema<SocialLinkDocument>(
  {
    platform: {
      type: String,
      required: [true, 'Platform ist erforderlich'],
      enum: {
        values: ['instagram', 'facebook', 'youtube', 'spotify', 'tiktok', 'twitter', 'soundcloud', 'bandcamp', 'other'],
        message: 'Ungültige Platform',
      },
    },
    url: {
      type: String,
      required: [true, 'URL ist erforderlich'],
      trim: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: [100, 'Label darf maximal 100 Zeichen lang sein'],
    },
    icon: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Reihenfolge muss mindestens 0 sein'],
    },
    active: {
      type: Boolean,
      default: true,
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

// Index für Sortierung
socialLinkSchema.index({ order: 1 });
socialLinkSchema.index({ active: 1 });

export const SocialLinkModel = mongoose.model<SocialLinkDocument>(
  'SocialLink',
  socialLinkSchema
);
