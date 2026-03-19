import { Router } from 'express';
import { login, getMe, resetPassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.patch('/reset-password', authenticateToken, resetPassword);
export default router;
