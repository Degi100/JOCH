import { Router } from 'express';
import { API_ROUTES } from '@joch/shared';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'JOCH Backend API is running! 🎸',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Import and mount route modules
// router.use(API_ROUTES.AUTH.LOGIN, authRoutes);
// router.use(API_ROUTES.BAND_MEMBERS.BASE, bandMemberRoutes);
// router.use(API_ROUTES.NEWS.BASE, newsRoutes);
// router.use(API_ROUTES.GIGS.BASE, gigRoutes);
// router.use(API_ROUTES.SONGS.BASE, songRoutes);
// router.use(API_ROUTES.GALLERY.BASE, galleryRoutes);
// router.use(API_ROUTES.CONTACT.BASE, contactRoutes);

export default router;
