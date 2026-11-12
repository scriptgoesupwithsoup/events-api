import { Router } from 'express';
import * as eventController from '../controllers/event.controller.js';
import * as registrationController from '../controllers/registration.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { createEventBody, updateEventBody, listEventsQuery } from '../validators/event.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', validate({ query: listEventsQuery }), asyncHandler(eventController.list));
router.get('/:id', validate({ params: idParams }), asyncHandler(eventController.getById));

router.post('/', requireAuth, requireRole('admin'), validate({ body: createEventBody }), asyncHandler(eventController.create));
router.patch('/:id', requireAuth, requireRole('admin'), validate({ params: idParams, body: updateEventBody }), asyncHandler(eventController.update));
router.delete('/:id', requireAuth, requireRole('admin'), validate({ params: idParams }), asyncHandler(eventController.remove));

// Записи на мероприятие
router.post('/:id/registrations', requireAuth, requireRole('user', 'admin'), validate({ params: idParams }), asyncHandler(registrationController.register));
router.get('/:id/registrations', requireAuth, requireRole('admin'), validate({ params: idParams }), asyncHandler(registrationController.listByEvent));

export default router;
