import { Router } from 'express';
import * as controller from '../controllers/registration.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/my', requireAuth, requireRole('user', 'admin'), asyncHandler(controller.listMine));
router.delete('/:id', requireAuth, requireRole('user', 'admin'), validate({ params: idParams }), asyncHandler(controller.cancel));

export default router;
