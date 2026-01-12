import { Router } from 'express';
import { ApplicationController } from './application.controller.js';
import ApplicationService from "@/applications/application.service.js"
import { requireAuth } from '@/shared/middleware/auth.middleware.js';

const router = Router();

const applicationService = new ApplicationService()
const applicationController = new ApplicationController(applicationService);

/**
 * @route GET /api/applications
 * @description List applications with optional filters, pagination, and sorting
 * @access Public
 */
router.get('/', requireAuth ,applicationController.getPaginatedApplications);

/**
 * @route GET /api/applications/:slug
 * @description Get a single application by slug
 * @access Public
 */
router.get('/:slug', requireAuth ,applicationController.getApplicationBySlug);

export default router;