import type { Request, Response } from 'express';
import type { ApplicationsServiceResult } from './application.service.js';
import { ApplicationsRequestSchema } from './dto/index.js';
import { logger } from '@/shared/utils/logger.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import type { ApplicationsListResponse, ApplicationFilters } from './dto/index.js';

export interface IApplicationService {
  getApplications(limit: number, page: number, filters?: ApplicationFilters): Promise<ApplicationsServiceResult>;
}

export class ApplicationController {
  constructor(private applicationService: IApplicationService) {}

  /**
   * Handles GET requests for applications list with pagination and filtering
   * @route GET /api/applications
   * @param req - Express request object with query parameters
   * @param res - Express response object
   */
  getApplications = async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplicationsRequestSchema.safeParse(req.query);
    
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

    const { data, total } = await this.applicationService.getApplications(limit, page, filters);

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
}
