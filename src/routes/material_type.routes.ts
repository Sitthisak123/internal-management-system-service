import { Router } from 'express';
import {
  getMaterialTypes,
  getMaterialTypeById,
  createMaterialType,
  updateMaterialType,
  deleteMaterialType,
} from '../controllers/material_type.controller.js';

const router = Router();

router.get('/', getMaterialTypes);
router.get('/:id', getMaterialTypeById);
router.post('/', createMaterialType);
router.put('/:id', updateMaterialType);
router.delete('/:id', deleteMaterialType);

module.exports = router;
