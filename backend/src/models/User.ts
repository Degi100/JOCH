import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { User as IUser } from '@joch/shared';

export interface UserDocument extends Omit<IUser, '_id' | 'role'>, Document {
  role: 'admin' | 'member' | 'user';
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'E-Mail ist erforderlich'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Ungültige E-Mail Adresse',
      },
    },
    password: {
      type: String,
      required: [true, 'Passwort ist erforderlich'],
      minlength: [8, 'Passwort muss mindestens 8 Zeichen lang sein'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'user'],
      default: 'user',
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
