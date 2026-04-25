import type { Request, Response } from 'express';
import { logger } from '@/shared/utils/logger.js';
import type { IFavoritesService } from './favorites.service.js';
import {
  ApplicationFavoritesCountResponseSchema,
  ApplicationFavoritesParamsSchema,
  ApplicationFavoritesResponseSchema,
  CreateFavoriteRequestSchema,
  DeleteFavoriteParamsSchema,
  FavoriteResponseSchema,
  UserFavoritesParamsSchema,
  UserFavoritesResponseSchema,
  type ApplicationFavoritesCountResponse,
  type ApplicationFavoritesResponse,
  type UserFavoritesResponse,
} from './dto/index.js';

export default class FavoritesController {
  constructor(private favoritesService: IFavoritesService) {}

  private getAuthenticatedUserId = (res: Response): string => res.locals.authUserId as string;

  createFavorite = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(res);

    const body = CreateFavoriteRequestSchema.parse(req.body);

    logger.debug('Creating favorite', { userId, applicationId: body.applicationId });

    await this.favoritesService.createFavorite({
      userId,
      applicationId: body.applicationId,
    });

    logger.info('Favorite created successfully', { userId, applicationId: body.applicationId });
    res.status(204).send();
  };

  getUserFavorites = async (req: Request, res: Response): Promise<void> => {
    const { userId } = UserFavoritesParamsSchema.parse(req.params);

    logger.debug('Fetching user favorites', { userId });

    const applicationIds = await this.favoritesService.getUserFavorite(userId);

    const response: UserFavoritesResponse = {
      userId,
      applicationIds,
    };

    logger.info('User favorites retrieved successfully', {
      userId,
      count: applicationIds.length,
    });

    const validatedResponse = UserFavoritesResponseSchema.parse(response);
    res.status(200).json(validatedResponse);
  };

  getApplicationFavorites = async (req: Request, res: Response): Promise<void> => {
    const { applicationId } = ApplicationFavoritesParamsSchema.parse(req.params);

    logger.debug('Fetching application favorites', {
      applicationId,
    });

    const userIds = await this.favoritesService.getApplicationFavorites(applicationId);

    const response: ApplicationFavoritesResponse = {
      applicationId,
      userIds,
      total: userIds.length,
    };

    logger.info('Application favorites retrieved successfully', {
      applicationId,
      count: userIds.length,
    });

    const validatedResponse = ApplicationFavoritesResponseSchema.parse(response);
    res.status(200).json(validatedResponse);
  };

  getApplicationFavoritesCount = async (req: Request, res: Response): Promise<void> => {
    const { applicationId } = ApplicationFavoritesParamsSchema.parse(req.params);

    logger.debug('Fetching application favorites count', {
      applicationId,
    });

    const count = await this.favoritesService.getApplicationFavoritesCount(applicationId);

    const response: ApplicationFavoritesCountResponse = {
      applicationId,
      count,
    };

    logger.info('Application favorites count retrieved successfully', response);

    const validatedResponse = ApplicationFavoritesCountResponseSchema.parse(response);
    res.status(200).json(validatedResponse);
  };

  deleteFavorite = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(res);

    const { applicationId } = DeleteFavoriteParamsSchema.parse(req.params);

    logger.debug('Deleting favorite', { userId, applicationId });

    const favorite = await this.favoritesService.deleteFavorite(userId, applicationId);

    logger.info('Favorite deleted successfully', { userId, applicationId });

    const validatedResponse = FavoriteResponseSchema.parse(favorite);
    res.status(200).json(validatedResponse);
  };
}
