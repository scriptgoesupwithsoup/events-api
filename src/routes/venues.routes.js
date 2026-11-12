import { Router } from 'express';
import * as controller from '../controllers/venue.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { createVenueBody, updateVenueBody } from '../validators/venue.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(controller.list));
router.get('/:id', validate({ params: idParams }), asyncHandler(controller.getById));

router.post('/', requireAuth, requireRole('admin'), validate({ body: createVenueBody }), asyncHandler(controller.create));
router.patch('/:id', requireAuth, requireRole('admin'), validate({ params: idParams, body: updateVenueBody }), asyncHandler(controller.update));
router.delete('/:id', requireAuth, requireRole('admin'), validate({ params: idParams }), asyncHandler(controller.remove));

export default router;
