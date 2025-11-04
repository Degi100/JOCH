import { Router } from 'express';
import authRoutes from './auth.routes';
import gigRoutes from './gig.routes';
import newsRoutes from './news.routes';
import bandMemberRoutes from './bandMember.routes';
import songRoutes from './song.routes';
import galleryRoutes from './gallery.routes';
import contactRoutes from './contact.routes';
import uploadRoutes from './upload.routes';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'JOCH Backend API is running! 🎸',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/gigs', gigRoutes);
router.use('/news', newsRoutes);
router.use('/band-members', bandMemberRoutes);
router.use('/songs', songRoutes);
router.use('/gallery', galleryRoutes);
router.use('/contact', contactRoutes);
router.use('/upload', uploadRoutes);

export default router;
