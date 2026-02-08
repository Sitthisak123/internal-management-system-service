import { Router } from 'express';
// Note: In TS, you usually don't need the .js extension in imports unless you have a specific config
import { 
  getAllRequisitions, 
  getRequisitionById, 
  createRequisition, 
  updateRequisition, 
  deleteRequisition 
} from '../controllers/requisition.controller'; 
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getAllRequisitions);
router.get('/:id', authenticateToken, getRequisitionById);
router.post('/', authenticateToken, createRequisition);
router.put('/:id', authenticateToken, updateRequisition);
router.delete('/:id', authenticateToken, deleteRequisition);

export default router;