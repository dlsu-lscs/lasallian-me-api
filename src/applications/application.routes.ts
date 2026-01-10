import { Router } from 'express';
import { ApplicationController } from './application.controller.js';
import ApplicationService from "@/applications/application.service.js"

const router = Router();

const applicationService = new ApplicationService()
const applicationController = new ApplicationController(applicationService);

/**
 * @route GET /api/applications
 * @description List applications with optional filters, pagination, and sorting
 * @access Public
 */
router.get('/', applicationController.getApplications);

export default router;