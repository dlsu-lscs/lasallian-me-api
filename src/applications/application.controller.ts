import type { Request, Response } from 'express';
import type { ApplicationsServiceResult } from './application.service.js';
import {
  ApplicationsListQuerySchema,
  ApplicationSlugParamsSchema,
  ApplicationResponseSchema,
} from './dto/index.js';
import { logger } from '@/shared/utils/logger.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import type { ApplicationsListResponse, ApplicationsListFilters } from './dto/index.js';
import type { SelectApplication } from './application.model.js';

export interface IApplicationService {
  getPaginatedApplications(limit: number, page: number, filters?: ApplicationsListFilters): Promise<ApplicationsServiceResult>;
  getApplicationBySlug(slug: string): Promise<SelectApplication | undefined>;
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
      throw new HttpError(400, 'Invalid query parameters', 'VALIDATION_ERROR', 
        parsed.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      );
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
      throw new HttpError(
        400,
        'Invalid path parameters',
        'VALIDATION_ERROR',
        parsed.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    logger.debug('Fetching application by slug', { slug: parsed.data.slug });

    const application = await this.applicationService.getApplicationBySlug(parsed.data.slug);

    if (!application) {
      logger.info('Application not found', { slug: parsed.data.slug });
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    const responseValidation = ApplicationResponseSchema.safeParse(application);
    if (!responseValidation.success) {
      logger.error('Invalid application response data', { errors: responseValidation.error.issues });
      throw new HttpError(500, 'Internal server error', 'INTERNAL_ERROR');
    }

    logger.info('Application retrieved successfully', { applicationId: application.id, slug: application.slug });
    res.status(200).json(responseValidation.data);
  }
}
