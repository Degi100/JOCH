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
      required: [true, 'Bio ist erforderlich'],
      trim: true,
      minlength: [10, 'Bio muss mindestens 10 Zeichen lang sein'],
      maxlength: [1000, 'Bio darf maximal 1000 Zeichen lang sein'],
    },
    image: {
      type: String,
      required: [true, 'Bild ist erforderlich'],
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
