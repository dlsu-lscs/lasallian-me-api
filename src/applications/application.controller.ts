import type { Request, Response } from 'express';
import type { ApplicationsList } from './application.service.js';
import {
  ApplicationsListQuerySchema,
  ApplicationSlugParamsSchema,
  ApplicationIdParamsSchema,
  CreateApplicationRequestSchema,
  PatchApplicationRequestSchema,
} from './dto/index.js';
import { logger } from '@/shared/utils/logger.js';
import type { ApplicationsListResponse, ApplicationsListFilters } from './dto/index.js';
import type { SelectApplication, InsertApplication } from './application.model.js';

export interface IApplicationService {
  getPaginatedApplications(
    limit: number,
    page: number,
    filters?: ApplicationsListFilters,
  ): Promise<ApplicationsList>;
  getApplicationBySlug(slug: string): Promise<SelectApplication>;
  createApplication(app: InsertApplication): Promise<SelectApplication>;
  patchApplicationById(id: number, updates: Partial<InsertApplication>): Promise<SelectApplication>;
  deleteApplicationById(id: number): Promise<SelectApplication>;
}

export class ApplicationController {
  constructor(private applicationService: IApplicationService) {}

  /**
   * Handles GET requests for applications list with pagination and filtering
   * @route GET /api/applications
   */
  getPaginatedApplications = async (req: Request, res: Response): Promise<void> => {
    const { limit, page, ...filters } = ApplicationsListQuerySchema.parse(req.query);

    logger.debug('Fetching applications', { limit, page, filters });

    const { data, total } = await this.applicationService.getPaginatedApplications(
      limit,
      page,
      filters,
    );

    logger.info('Applications retrieved successfully', {
      count: data.length,
      total,
      page,
      limit,
    });

    const response: ApplicationsListResponse = {
      data,
      meta: {
        page,
        limit,
        count: data.length,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
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
    res.status(200).json(application);
  };

  /**
   * @route POST request for creating a single application
   */
  createApplication = async (req: Request, res: Response): Promise<void> => {
    const body = CreateApplicationRequestSchema.parse(req.body);

    logger.debug('Creating application', { slug: body.slug });

    const application = await this.applicationService.createApplication(body);

    logger.info('Application created successfully', {
      applicationId: application.id,
      slug: application.slug,
    });
    res.status(201).json(application);
  };

  /**
   * Handles PATCH requests for updating an application
   * @route PATCH /api/applications/:id
   */
  patchApplicationById = async (req: Request, res: Response): Promise<void> => {
    const { id } = ApplicationIdParamsSchema.parse(req.params);
    const body = PatchApplicationRequestSchema.parse(req.body);

    logger.debug('Patching application', { id, updates: body });

    const application = await this.applicationService.patchApplicationById(id, body);

    logger.info('Application patched successfully', {
      applicationId: application.id,
      slug: application.slug,
    });
    res.status(200).json(application);
  };

  /**
   * Handles DELETE requests for removing an application
   * @route DELETE /api/applications/:id
   */
  deleteApplicationById = async (req: Request, res: Response): Promise<void> => {
    const { id } = ApplicationIdParamsSchema.parse(req.params);

    logger.debug('Deleting application', { id });

    const application = await this.applicationService.deleteApplicationById(id);

    logger.info('Application deleted successfully', {
      applicationId: application.id,
      slug: application.slug,
    });
    res.status(200).json(application);
  };
}
