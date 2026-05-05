import type { Request, Response } from 'express';
import type { IApplicationService } from './application.service.js';
import {
  ApplicationsListQuerySchema,
  ApplicationSlugParamsSchema,
  ApplicationIdParamsSchema,
  CreateApplicationRequestSchema,
  PatchApplicationRequestSchema,
  ReviewApplicationRequestSchema,
  ApplicationsListResponseSchema,
  ApplicationResponseSchema,
} from './dto/index.js';
import { AdminApplicationsListQuerySchema } from './dto/admin-applications-list-query.dto.js';
import { logger } from '@/shared/utils/logger.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { sendStatusNotificationEmail } from '@/shared/infrastructure/mailer.js';

export class ApplicationController {
  constructor(private applicationService: IApplicationService) {}

  /**
   * Handles GET requests for applications list with pagination and filtering
   * @route GET /api/applications
   */
  getPaginatedApplications = async (req: Request, res: Response): Promise<void> => {
    const { limit, page, ...filters } = ApplicationsListQuerySchema.parse(req.query);

    logger.debug('Fetching applications', { limit, page, filters });

    const response = await this.applicationService.getPaginatedApplications(limit, page, filters);

    logger.info('Applications retrieved successfully', {
      count: response.data.length,
      total: response.meta.total,
      page,
      limit,
    });

    const parsed = ApplicationsListResponseSchema.parse(response);
    res.status(200).json(parsed);
  };

  /**
   * Handles GET requests for applications in moderation queue (Admin only)
   * @route GET /api/applications/admin
   */
  getAdminApplications = async (req: Request, res: Response): Promise<void> => {
    const { limit, page, ...filters } = AdminApplicationsListQuerySchema.parse(req.query);

    logger.debug('Fetching admin applications', { limit, page, filters });

    const response = await this.applicationService.getAdminApplications(limit, page, filters);

    logger.info('Admin applications retrieved successfully', {
      count: response.data.length,
      total: response.meta.total,
      page,
      limit,
    });

    const parsed = ApplicationsListResponseSchema.parse(response);
    res.status(200).json(parsed);
  };

  /**
   * Handles GET requests for a single application by slug
   * @route GET /api/applications/:slug
   */
  getApplicationBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = ApplicationSlugParamsSchema.parse(req.params);

    logger.debug('Fetching application by slug', { slug });

    const application = await this.applicationService.getApplicationBySlug(slug);

    logger.info('Application retrieved successfully', {
      applicationId: application.id,
      slug: application.slug,
    });

    const parsed = ApplicationResponseSchema.parse(application);
    res.status(200).json(parsed);
  };

  /**
   * @route POST request for creating a single application
   */
  createApplication = async (req: Request, res: Response): Promise<void> => {
    const body = CreateApplicationRequestSchema.parse(req.body);
    const authUserId = this.getAuthUserId(res);

    logger.debug('Creating application', { slug: body.slug });

    await this.applicationService.createApplication(body, authUserId);

    logger.info('Application created successfully', {
      applicationId: authUserId,
      slug: body.slug,
    });

    res.status(201).json({ slug: body.slug });
  };

  /**
   * Handles PATCH requests for updating an application
   * @route PATCH /api/applications/:id
   */
  patchApplicationById = async (req: Request, res: Response): Promise<void> => {
    const { id } = ApplicationIdParamsSchema.parse(req.params);
    const body = PatchApplicationRequestSchema.parse(req.body);
    const authUserId = this.getAuthUserId(res);

    logger.debug('Patching application', { id, updates: body });

    const slug = await this.applicationService.patchApplicationById(id, body, authUserId);

    logger.info('Application patched successfully', {
      applicationId: authUserId,
      slug,
    });

    res.status(200).json({ slug });
  };

  /**
   * Handles DELETE requests for removing an application
   * @route DELETE /api/applications/:id
   */
  deleteApplicationById = async (req: Request, res: Response): Promise<void> => {
    const { id } = ApplicationIdParamsSchema.parse(req.params);
    const authUserId = this.getAuthUserId(res);

    logger.debug('Deleting application', { id });

    await this.applicationService.deleteApplicationById(id, authUserId);

    logger.info('Application deleted successfully', {
      applicationId: authUserId,
      id: id,
    });

    res.status(204).send();
  };

  /**
   * Handles PATCH requests for admin review (approve/reject) of an application
   * @route PATCH /api/applications/admin/:id/review
   */
  reviewAdminApplicationById = async (req: Request, res: Response): Promise<void> => {
    const { id } = ApplicationIdParamsSchema.parse(req.params);
    const body = ReviewApplicationRequestSchema.parse(req.body);

    logger.debug('Reviewing application', { id, decision: body.status });

    await this.applicationService.reviewAdminApplicationById(id, body);

    const user = await this.applicationService.getUserByApplicationId(id);

    await sendStatusNotificationEmail(
      user.email,
      `Your application has been ${body.status}`,
      `Dear Applicant,\n\nWe are writing to inform you that your application has been ${body.status}.\n\nThank you for your interest.\n\nBest regards,\nThe Team`,
    );

    logger.info('Application reviewed successfully', {
      applicationId: id,
      status: body.status,
    });

    res.status(204).send();
  };

  private getAuthUserId(res: Response): string {
    const authUserId = res.locals.authUserId as string | undefined;

    if (!authUserId) {
      throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    return authUserId;
  }
}
