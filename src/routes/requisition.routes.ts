import { Router } from 'express';
// Note: In TS, you usually don't need the .js extension in imports unless you have a specific config
import { 
  getAllRequisitions, 
  getRequisitionById, 
  createRequisition, 
  updateRequisition, 
  deleteRequisition,
  getRequisitionVolume,
  getCountFilteredByStatus,
  getRecentActivities,
  evaluateForm
} from '../controllers/requisition.controller'; 
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getAllRequisitions);
router.get('/volume', authenticateToken, getRequisitionVolume);
router.get('/recentActivities', authenticateToken, getRecentActivities);
router.get('/statusCount/:status', authenticateToken, getCountFilteredByStatus);
router.get('/:id', authenticateToken, getRequisitionById);
router.post('/', authenticateToken, createRequisition);
router.put('/:id', authenticateToken, updateRequisition);
router.put('/:id/evaluate', authenticateToken, evaluateForm);
router.delete('/:id', authenticateToken, deleteRequisition);

export default router;