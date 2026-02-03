import { Router } from 'express';
import { getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial } from '../controllers/material.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getAllMaterials);
router.get('/:id', authenticateToken, getMaterialById);
router.post('/', authenticateToken, createMaterial);
router.put('/:id', authenticateToken, updateMaterial);
router.delete('/:id', authenticateToken, deleteMaterial);

export default router;
