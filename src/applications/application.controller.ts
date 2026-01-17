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
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { formatZodErrors } from '@/shared/utils/validation.js';
import type { ApplicationsListResponse, ApplicationsListFilters } from './dto/index.js';
import type { SelectApplication, InsertApplication } from './application.model.js';

export interface IApplicationService {
  getPaginatedApplications(limit: number, page: number, filters?: ApplicationsListFilters): Promise<ApplicationsList>;
  getApplicationBySlug(slug: string): Promise<SelectApplication>;
  getApplicationById(id: number): Promise<SelectApplication | undefined>;
  createApplication(app: InsertApplication): Promise<SelectApplication>;
  patchApplicationById(id: number, updates: Partial<InsertApplication>): Promise<SelectApplication>;
  deleteApplicationById(id: number): Promise<SelectApplication>;
}

export class ApplicationController {
  constructor(private applicationService: IApplicationService) {}

  /**
   * Handles GET requests for applications list with pagination and filtering
   * @route GET /api/applications
   * @param req - Express request object with query parameters
   * @param res - Express response object
   */
  getPaginatedApplications = async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplicationsListQuerySchema.safeParse(req.query);
    
    if (!parsed.success) {
      logger.warn('Invalid query parameters', { errors: parsed.error.issues });
      throw new HttpError(400, 'Invalid query parameters', 'VALIDATION_ERROR', formatZodErrors(parsed.error.issues));
    }

    const { limit, page, ...filters } = parsed.data;

    logger.debug('Fetching applications', { limit, page, filters });

    const { data, total } = await this.applicationService.getPaginatedApplications(limit, page, filters);

    logger.info('Applications retrieved successfully', { 
      count: data.length, 
      total,
      page, 
      limit 
    });

    const response: ApplicationsListResponse = {
      data,
      meta: {
        page,
        limit,
        count: data.length,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.status(200).json(response);
  }

  /**
   * Handles GET requests for a single application by slug
   * @route GET /api/applications/:slug
   * @param req - Express request object with path parameters
   * @param res - Express response object
   */
  getApplicationBySlug = async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplicationSlugParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      logger.warn('Invalid path parameters', { errors: parsed.error.issues });
      throw new HttpError(400, 'Invalid path parameters', 'VALIDATION_ERROR', formatZodErrors(parsed.error.issues));
    }

    logger.debug('Fetching application by slug', { slug: parsed.data.slug });

    const application = await this.applicationService.getApplicationBySlug(parsed.data.slug);

    logger.info('Application retrieved successfully', { applicationId: application.id, slug: application.slug });
    res.status(200).json(application);
  }

  /**
   * @route POST request for creating a single application
   * @param req - Express request object with path parameters
   * @param res - Express response object
   */
  createApplication = async(req: Request, res: Response): Promise<void> => {
    const parsed = CreateApplicationRequestSchema.safeParse(req.body)

    if(!parsed.success){
      logger.warn('Invalid request body', { errors: parsed.error.issues });
      throw new HttpError(400, "Invalid request body", "VALIDATION_ERROR", formatZodErrors(parsed.error.issues))
    }

    logger.debug('Creating application', { slug: parsed.data.slug });

    const application = await this.applicationService.createApplication(parsed.data)

    logger.info('Application created successfully', { applicationId: application.id, slug: application.slug });
    res.status(201).json(application)
  }

  /**
   * Handles PATCH requests for updating an application
   * @route PATCH /api/applications/:id
   * @param req - Express request object with path parameters and body
   * @param res - Express response object
   */
  patchApplicationById = async (req: Request, res: Response): Promise<void> => {
    const paramsResult = ApplicationIdParamsSchema.safeParse(req.params);

    if (!paramsResult.success) {
      logger.warn('Invalid path parameters', { errors: paramsResult.error.issues });
      throw new HttpError(400, 'Invalid path parameters', 'VALIDATION_ERROR', formatZodErrors(paramsResult.error.issues));
    }

    const bodyResult = PatchApplicationRequestSchema.safeParse(req.body);

    if (!bodyResult.success) {
      logger.warn('Invalid request body', { errors: bodyResult.error.issues });
      throw new HttpError(400, 'Invalid request body', 'VALIDATION_ERROR', formatZodErrors(bodyResult.error.issues));
    }

    const { id } = paramsResult.data;

    logger.debug('Patching application', { id, updates: bodyResult.data });

    const application = await this.applicationService.patchApplicationById(id, bodyResult.data);

    logger.info('Application patched successfully', { applicationId: application.id, slug: application.slug });
    res.status(200).json(application);
  }

  /**
   * Handles DELETE requests for removing an application
   * @route DELETE /api/applications/:id
   * @param req - Express request object with path parameters
   * @param res - Express response object
   */
  deleteApplicationById = async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplicationIdParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      logger.warn('Invalid path parameters', { errors: parsed.error.issues });
      throw new HttpError(400, 'Invalid path parameters', 'VALIDATION_ERROR', formatZodErrors(parsed.error.issues));
    }

    const { id } = parsed.data;

    logger.debug('Deleting application', { id });

    const application = await this.applicationService.deleteApplicationById(id);

    logger.info('Application deleted successfully', { applicationId: application.id, slug: application.slug });
    res.status(200).json(application);
  }
}
