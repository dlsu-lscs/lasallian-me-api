import { Router } from 'express';
import { ApplicationController } from './application.controller.js';

const router = Router();
const applicationController = new ApplicationController();

/**
 * @route GET /api/applications
 * @description List applications with optional filters, pagination, and sorting
 * @access Public
 */
router.get('/', applicationController.getApplications);

export default router;