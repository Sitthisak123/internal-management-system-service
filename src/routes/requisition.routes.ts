import { Router } from 'express';
import { getAllRequisitions, getRequisitionById, createRequisition, updateRequisition, deleteRequisition } from '../controllers/requisition.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getAllRequisitions);
router.get('/:id', authenticateToken, getRequisitionById);
router.post('/', authenticateToken, createRequisition);
router.put('/:id', authenticateToken, updateRequisition);
router.delete('/:id', authenticateToken, deleteRequisition);

export default router;
