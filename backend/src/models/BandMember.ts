import mongoose, { Schema, Document } from 'mongoose';
import type { BandMember as IBandMember } from '@joch/shared';

export interface BandMemberDocument extends Omit<IBandMember, '_id'>, Document {}

const bandMemberSchema = new Schema<BandMemberDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name ist erforderlich'],
      trim: true,
      minlength: [2, 'Name muss mindestens 2 Zeichen lang sein'],
      maxlength: [100, 'Name darf maximal 100 Zeichen lang sein'],
    },
    instrument: {
      type: String,
      required: [true, 'Instrument ist erforderlich'],
      trim: true,
      minlength: [2, 'Instrument muss mindestens 2 Zeichen lang sein'],
      maxlength: [100, 'Instrument darf maximal 100 Zeichen lang sein'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio darf maximal 1000 Zeichen lang sein'],
      default: '',
    },
    image: {
      type: String,
      required: [true, 'Bild ist erforderlich'],
    },
    imageScale: {
      type: Number,
      min: [0.8, 'Zoom muss mindestens 0.8 sein'],
      max: [3, 'Zoom darf maximal 3 sein'],
      default: 1,
    },
    imagePositionX: {
      type: Number,
      min: [0, 'Position muss mindestens 0 sein'],
      max: [100, 'Position darf maximal 100 sein'],
      default: 50,
    },
    imagePositionY: {
      type: Number,
      min: [0, 'Position muss mindestens 0 sein'],
      max: [100, 'Position darf maximal 100 sein'],
      default: 50,
    },
    imageAspectRatio: {
      type: Number,
      min: [0.1, 'Aspect Ratio muss mindestens 0.1 sein'],
      max: [10, 'Aspect Ratio darf maximal 10 sein'],
      default: 1,
    },
    order: {
      type: Number,
      required: [true, 'Reihenfolge ist erforderlich'],
      min: [0, 'Reihenfolge muss mindestens 0 sein'],
      max: [2, 'Reihenfolge darf maximal 2 sein'],
      unique: true,
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

// Index is already created by unique: true on order field

export const BandMemberModel = mongoose.model<BandMemberDocument>(
  'BandMember',
  bandMemberSchema
);
