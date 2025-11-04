import { Router } from 'express';
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleAudio,
} from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware';
import { uploadImage, uploadAudio } from '../config';

const router = Router();

// All upload routes require authentication (Admin/Member only)

// Single image upload
router.post(
  '/image',
  authenticate,
  authorize('admin', 'member'),
  uploadImage.single('image'),
  uploadSingleImage
);

// Multiple images upload (max 10)
router.post(
  '/images',
  authenticate,
  authorize('admin', 'member'),
  uploadImage.array('images', 10),
  uploadMultipleImages
);

// Single audio upload
router.post(
  '/audio',
  authenticate,
  authorize('admin', 'member'),
  uploadAudio.single('audio'),
  uploadSingleAudio
);

export default router;
