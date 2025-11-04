import mongoose, { Schema, Document } from 'mongoose';
import type { Song as ISong } from '@joch/shared';

export interface SongDocument extends Omit<ISong, '_id'>, Document {}

const songSchema = new Schema<SongDocument>(
  {
    title: {
      type: String,
      required: [true, 'Titel ist erforderlich'],
      trim: true,
      maxlength: [200, 'Titel darf maximal 200 Zeichen lang sein'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration ist erforderlich'],
      min: [1, 'Duration muss mindestens 1 Sekunde sein'],
    },
    audioFile: {
      type: String,
      required: [true, 'Audio-Datei ist erforderlich'],
    },
    coverArt: {
      type: String,
    },
    releaseDate: {
      type: Date,
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

// Index for sorting
songSchema.index({ order: 1 });

export const SongModel = mongoose.model<SongDocument>('Song', songSchema);
