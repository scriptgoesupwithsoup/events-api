import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventsRoutes from './events.routes.js';
import venuesRoutes from './venues.routes.js';
import registrationsRoutes from './registrations.routes.js';

const router = Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/venues', venuesRoutes);
router.use('/registrations', registrationsRoutes);

export default router;
