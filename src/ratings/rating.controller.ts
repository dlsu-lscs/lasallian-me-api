import type { Request, Response } from 'express';
import { logger } from '@/shared/utils/logger.js';
import type {
  ApplicationRatingResponse,
  RatingResponse,
  UserRatingsResponse,
} from './dto/index.js';
import {
  ApplicationRatingParamsSchema,
  ApplicationRatingResponseSchema,
  CreateRatingRequestSchema,
  PatchRatingRequestSchema,
  RatingResponseSchema,
  UserRatingsParamsSchema,
  UserRatingsResponseSchema,
} from './dto/index.js';
import type { IRatingService } from './rating.service.js';

export default class RatingController {
  constructor(private readonly ratingsService: IRatingService) {}

  private getAuthenticatedUserId = (res: Response): string => res.locals.authUserId as string;

  getApplicationRating = async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplicationRatingParamsSchema.parse(req.params);

    logger.debug('Fetching application ratings', { slug: parsed.slug });

    const ratings = await this.ratingsService.getApplicationRatingBySlug(parsed.slug);

    const response: ApplicationRatingResponse = {
      applicationSlug: ratings.applicationSlug,
      ratings: ratings.ratings,
      total: ratings.total,
      averageScore: ratings.averageScore,
    };

    logger.info('Application ratings retrieved successfully', {
      slug: parsed.slug,
      total: response.total,
      averageScore: response.averageScore,
    });

    const validatedResponse = ApplicationRatingResponseSchema.parse(response);
    res.status(200).json(validatedResponse);
  };

  getUserRatings = async (req: Request, res: Response): Promise<void> => {
    const { userId } = UserRatingsParamsSchema.parse(req.params);

    logger.debug('Fetching user ratings', { userId });

    const ratings = await this.ratingsService.getRatingByUserId(userId);

    const response: UserRatingsResponse = {
      userId,
      ratings,
      total: ratings.length,
    };

    logger.info('User ratings retrieved successfully', {
      userId,
      total: response.total,
    });

    const validatedResponse = UserRatingsResponseSchema.parse(response);
    res.status(200).json(validatedResponse);
  };

  createRating = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(res);

    const params = ApplicationRatingParamsSchema.parse(req.params);
    const body = CreateRatingRequestSchema.parse(req.body);

    logger.debug('Creating rating', { slug: params.slug, userId });

    const created = await this.ratingsService.createRatingByApplicationSlug(
      params.slug,
      userId,
      body,
    );

    const response: RatingResponse = created;

    logger.info('Rating created successfully', {
      slug: params.slug,
      applicationId: response.applicationId,
      score: response.score,
    });

    const validatedResponse = RatingResponseSchema.parse(response);
    res.status(201).json(validatedResponse);
  };

  patchRating = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(res);

    const params = ApplicationRatingParamsSchema.parse(req.params);
    const body = PatchRatingRequestSchema.parse(req.body);

    logger.debug('Patching rating', { slug: params.slug, userId });

    const patched = await this.ratingsService.patchRatingByApplicationSlug(params.slug, userId, {
      score: body.score,
      comment: body.comment,
      isAnonymous: body.isAnonymous,
    });

    const response: RatingResponse = patched;

    logger.info('Rating patched successfully', {
      slug: params.slug,
      applicationId: response.applicationId,
      score: response.score,
    });

    const validatedResponse = RatingResponseSchema.parse(response);
    res.status(200).json(validatedResponse);
  };

  deleteRating = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(res);

    const params = ApplicationRatingParamsSchema.parse(req.params);

    logger.debug('Deleting rating', { slug: params.slug, userId });

    const deleted = await this.ratingsService.deleteRatingByApplicationSlug(params.slug, userId);

    const response: RatingResponse = deleted;

    logger.info('Rating deleted successfully', {
      slug: params.slug,
      applicationId: response.applicationId,
    });

    const validatedResponse = RatingResponseSchema.parse(response);
    res.status(200).json(validatedResponse);
  };
}
