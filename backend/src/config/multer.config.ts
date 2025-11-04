import multer from 'multer';
import path from 'path';
import { AppError, HTTP_STATUS } from '@joch/shared';

// Allowed file types
const IMAGE_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const AUDIO_MIMETYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav'];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Storage configuration
 */
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Determine folder based on file type
    if (IMAGE_MIMETYPES.includes(file.mimetype)) {
      cb(null, 'uploads/images');
    } else if (AUDIO_MIMETYPES.includes(file.mimetype)) {
      cb(null, 'uploads/audio');
    } else {
      cb(null, 'uploads/other');
    }
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter for images
 */
const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (IMAGE_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'Ungültiger Dateityp. Nur JPEG, JPG, PNG und WebP sind erlaubt.'
      )
    );
  }
};

/**
 * File filter for audio
 */
const audioFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (AUDIO_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'Ungültiger Dateityp. Nur MP3 und WAV sind erlaubt.'
      )
    );
  }
};

/**
 * Multer upload for images
 */
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

/**
 * Multer upload for audio
 */
export const uploadAudio = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: MAX_AUDIO_SIZE,
  },
});

/**
 * Multer upload for any file type (images or audio)
 */
export const uploadAny = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if ([...IMAGE_MIMETYPES, ...AUDIO_MIMETYPES].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          HTTP_STATUS.BAD_REQUEST,
          'Ungültiger Dateityp. Nur Bilder (JPEG, PNG, WebP) und Audio (MP3, WAV) sind erlaubt.'
        )
      );
    }
  },
  limits: {
    fileSize: MAX_AUDIO_SIZE, // Use larger limit
  },
});
