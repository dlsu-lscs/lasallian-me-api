import { Router } from 'express';
import { getApplications } from './application.controller.js';

const router = Router();

/**
 * @route GET /api/applications
 * @description List applications with optional filters, pagination, and sorting
 * @access Public
 */
router.get('/', getApplications);

export default router;