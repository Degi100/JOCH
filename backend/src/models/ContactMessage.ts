import mongoose, { Schema, Document } from 'mongoose';
import type { ContactMessage as IContactMessage } from '@joch/shared';

export interface ContactMessageDocument extends Omit<IContactMessage, '_id'>, Document {}

const contactMessageSchema = new Schema<ContactMessageDocument>(
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
      required: [true, 'E-Mail ist erforderlich'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Ungültige E-Mail Adresse',
      },
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [200, 'Betreff darf maximal 200 Zeichen lang sein'],
    },
    message: {
      type: String,
      required: [true, 'Nachricht ist erforderlich'],
      trim: true,
      minlength: [10, 'Nachricht muss mindestens 10 Zeichen lang sein'],
      maxlength: [2000, 'Nachricht darf maximal 2000 Zeichen lang sein'],
    },
    read: {
      type: Boolean,
      default: false,
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

// Index for filtering unread messages
contactMessageSchema.index({ read: 1, createdAt: -1 });

export const ContactMessageModel = mongoose.model<ContactMessageDocument>(
  'ContactMessage',
  contactMessageSchema
);
