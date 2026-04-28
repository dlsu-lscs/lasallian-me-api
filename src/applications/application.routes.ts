import { Router } from 'express';
import { ApplicationController } from './application.controller.js';
import ApplicationService from '@/applications/application.service.js';
import { requireAuth, requireRole } from '@/shared/middleware/auth.middleware.js';
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
 * @route POST /api/applications
 * @description Create an application
 * @access Private
 */
router.post('/', requireAuth, applicationController.createApplication);

/**
 * @route PATCH /api/applications/:id
 * @description Update an application by ID
 * @access Private
 */
router.patch('/:id', requireAuth, applicationController.patchApplicationById);

/**
 * @route DELETE /api/applications/:id
 * @description Delete an application by ID
 * @access Private
 */
router.delete('/:id', requireAuth, applicationController.deleteApplicationById);

/**
 * @route GET /api/applications/admin
 * @description List applications in moderation queue (Admin only)
 * @access Private (Admin only)
 */
router.get('/admin', requireAuth, requireRole('admin'), applicationController.getAdminApplications);

/**
 * @route PATCH /api/applications/admin/:id/review
 * @description Approve or reject an application by ID
 * @access Private (Admin only)
 */
router.patch(
  '/admin/:id/review',
  requireAuth,
  requireRole('admin'),
  applicationController.reviewAdminApplicationById,
);

/**
 * @route GET /api/applications/:slug
 * @description Get a single application by slug
 * @access Public
 */
router.get('/:slug', applicationController.getApplicationBySlug);

export default router;
