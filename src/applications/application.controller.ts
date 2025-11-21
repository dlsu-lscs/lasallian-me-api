import type { Request, Response } from 'express';
import { ApplicationService } from './application.service.js';
import { ApplicationsRequestSchema } from './dto/index.js';
import { logger } from '@/shared/utils/logger.js';
import type { ApplicationsListResponse } from './dto/index.js';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  /**
   * Handles GET requests for applications list with pagination and filtering
   * @route GET /api/applications
   * @param req - Express request object with query parameters
   * @param res - Express response object
   */
  getApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = ApplicationsRequestSchema.safeParse(req.query);
      
      if (!parsed.success) {
        logger.warn('Invalid query parameters', { errors: parsed.error.issues });
        res.status(400).json({ 
          error: {
            message: 'Invalid query parameters',
            code: 'VALIDATION_ERROR',
            details: parsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
        return;
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

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching applications', { error: errorMessage });
      res.status(500).json({ 
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
        }
      });
    }
  };
}
6