import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  getWorkplaces,
  getWorkplaceById,
  createWorkplace,
  updateWorkplace,
  deleteWorkplace,
} from '../controllers/workplace.controller.js';

const router = Router();

router.get('/', authenticateToken, getWorkplaces);
router.get('/:id', authenticateToken, getWorkplaceById);
router.post('/', authenticateToken, createWorkplace);
router.put('/:id', authenticateToken, updateWorkplace);
router.delete('/:id', authenticateToken, deleteWorkplace);

export default router;
