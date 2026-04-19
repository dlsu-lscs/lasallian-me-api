import { Router } from 'express';
import { ApplicationController } from './application.controller.js';
import ApplicationService from "@/applications/application.service.js"
import { requireApiKey } from '@/shared/middleware/auth.middleware.js';
import { db } from '@/shared/config/database.js';

const router = Router();

const applicationService = new ApplicationService(db);
const applicationController = new ApplicationController(applicationService);

/**
 * @route GET /api/applications
 * @description List applications with optional filters, pagination, and sorting
 * @access Public
 */
router.get('/', applicationController.getPaginatedApplications);

/**
 * @route GET /api/applications/:slug
 * @description Get a single application by slug
 * @access Public
 */
router.get('/:slug', applicationController.getApplicationBySlug);

/**
 * @route POST /api/applications
 * @description Create an application
 * @access Private
 */
router.post('/', requireApiKey, applicationController.createApplication);

/**
 * @route PATCH /api/applications/:id
 * @description Update an application by ID
 * @access Private
 */
router.patch('/:id', requireApiKey, applicationController.patchApplicationById);

/**
 * @route DELETE /api/applications/:id
 * @description Delete an application by ID
 * @access Private
 */
router.delete('/:id', requireApiKey, applicationController.deleteApplicationById);

export default router;