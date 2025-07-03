import { Router } from 'express';
import { healthcheck } from '../controllers/healthcheck.controllers.js';

const router = Router();

router.get('/healthcheck', healthcheck);

export default router;