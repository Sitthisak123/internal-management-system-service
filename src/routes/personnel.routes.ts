import { Router } from 'express';
import { getAllPersonnel, getPersonnelById, createPersonnel, updatePersonnel, deletePersonnel } from '../controllers/personnel.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getAllPersonnel);
router.get('/:id', authenticateToken, getPersonnelById);
router.post('/', authenticateToken, createPersonnel);
router.put('/:id', authenticateToken, updatePersonnel);
router.delete('/:id', authenticateToken, deletePersonnel);

export default router;
