import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerBody, loginBody } from '../validators/auth.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', validate({ body: registerBody }), asyncHandler(controller.register));
router.post('/login', validate({ body: loginBody }), asyncHandler(controller.login));

export default router;
