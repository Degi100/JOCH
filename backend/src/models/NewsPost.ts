import mongoose, { Schema, Document } from 'mongoose';
import type { NewsPost as INewsPost } from '@joch/shared';

export interface NewsPostDocument extends Omit<INewsPost, '_id' | 'author'>, Document {
  author: mongoose.Types.ObjectId;
}

const newsPostSchema = new Schema<NewsPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Titel ist erforderlich'],
      trim: true,
      minlength: [5, 'Titel muss mindestens 5 Zeichen lang sein'],
      maxlength: [200, 'Titel darf maximal 200 Zeichen lang sein'],
    },
    content: {
      type: String,
      required: [true, 'Inhalt ist erforderlich'],
      minlength: [50, 'Inhalt muss mindestens 50 Zeichen lang sein'],
    },
    excerpt: {
      type: String,
      required: [true, 'Auszug ist erforderlich'],
      trim: true,
      minlength: [20, 'Auszug muss mindestens 20 Zeichen lang sein'],
      maxlength: [300, 'Auszug darf maximal 300 Zeichen lang sein'],
    },
    coverImage: {
      type: String,
      default: undefined,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Autor ist erforderlich'],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id.toString();
        if (ret.author && typeof ret.author === 'object') {
          ret.author = ret.author.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
newsPostSchema.index({ published: 1, publishedAt: -1 });
newsPostSchema.index({ createdAt: -1 });

// Auto-set publishedAt when publishing
newsPostSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const NewsPostModel = mongoose.model<NewsPostDocument>('NewsPost', newsPostSchema);
