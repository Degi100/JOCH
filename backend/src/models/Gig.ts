import mongoose, { Schema, Document } from 'mongoose';
import type { Gig as IGig } from '@joch/shared';

export interface GigDocument extends Omit<IGig, '_id'>, Document {}

const gigSchema = new Schema<GigDocument>(
  {
    title: {
      type: String,
      required: [true, 'Titel ist erforderlich'],
      trim: true,
      minlength: [3, 'Titel muss mindestens 3 Zeichen lang sein'],
      maxlength: [200, 'Titel darf maximal 200 Zeichen lang sein'],
    },
    venue: {
      type: String,
      required: [true, 'Veranstaltungsort ist erforderlich'],
      trim: true,
      maxlength: [200, 'Veranstaltungsort darf maximal 200 Zeichen lang sein'],
    },
    location: {
      type: String,
      required: [true, 'Stadt ist erforderlich'],
      trim: true,
      maxlength: [200, 'Stadt darf maximal 200 Zeichen lang sein'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Adresse darf maximal 300 Zeichen lang sein'],
    },
    date: {
      type: Date,
      required: [true, 'Datum ist erforderlich'],
    },
    time: {
      type: String,
      validate: {
        validator: (time: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),
        message: 'Ungültige Zeit (Format: HH:MM)',
      },
    },
    ticketLink: {
      type: String,
      validate: {
        validator: (url: string) => {
          if (!url) return true;
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Ungültiger Ticket-Link',
      },
    },
    price: {
      type: String,
      maxlength: [50, 'Preis darf maximal 50 Zeichen lang sein'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Beschreibung darf maximal 1000 Zeichen lang sein'],
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ['upcoming', 'past', 'cancelled'],
      default: 'upcoming',
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

// Indexes
gigSchema.index({ date: -1 });
gigSchema.index({ status: 1, date: -1 });

// Auto-update status based on date
gigSchema.pre('save', function (next) {
  if (this.status !== 'cancelled') {
    const now = new Date();
    this.status = this.date > now ? 'upcoming' : 'past';
  }
  next();
});

export const GigModel = mongoose.model<GigDocument>('Gig', gigSchema);
