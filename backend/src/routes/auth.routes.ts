import { Router } from 'express';
import { register, login, me, getAllUsers, updateUserRole } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, me);

// Admin only routes
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.patch('/users/:userId/role', authenticate, authorize('admin'), updateUserRole);

export default router;
