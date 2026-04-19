import type { Request, Response } from "express";
import { logger } from "@/shared/utils/logger.js";
import type { IFavoritesService } from "./favorites.service.js";
import {
  ApplicationFavoritesParamsSchema,
  CreateFavoriteRequestSchema,
  DeleteFavoriteParamsSchema,
  UserFavoritesParamsSchema,
  type ApplicationFavoritesCountResponse,
  type ApplicationFavoritesResponse,
  type UserFavoritesResponse,
} from "./dto/index.js";

export default class FavoritesController {
  constructor(private favoritesService: IFavoritesService) {}

  private getAuthenticatedUserId = (res: Response): string => res.locals.authUserId as string;

  createFavorite = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(res);

    const parsed = CreateFavoriteRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      logger.warn("Invalid request body", { errors: parsed.error.issues });
      throw parsed.error;
    }

    logger.debug("Creating favorite", { userId, applicationId: parsed.data.applicationId });

    await this.favoritesService.createFavorite({
      userId,
      applicationId: parsed.data.applicationId,
    });

    logger.info("Favorite created successfully", { userId, applicationId: parsed.data.applicationId });
    res.status(204).send();
  };

  getUserFavorites = async (req: Request, res: Response): Promise<void> => {
    const parsed = UserFavoritesParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      logger.warn("Invalid path parameters", { errors: parsed.error.issues });
      throw parsed.error;
    }

    logger.debug("Fetching user favorites", { userId: parsed.data.userId });

    const applicationIds = await this.favoritesService.getUserFavorite(parsed.data.userId);

    const response: UserFavoritesResponse = {
      userId: parsed.data.userId,
      applicationIds,
    };

    logger.info("User favorites retrieved successfully", {
      userId: parsed.data.userId,
      count: applicationIds.length,
    });
    res.status(200).json(response);
  };

  getApplicationFavorites = async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplicationFavoritesParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      logger.warn("Invalid path parameters", { errors: parsed.error.issues });
      throw parsed.error;
    }

    logger.debug("Fetching application favorites", {
      applicationId: parsed.data.applicationId,
    });

    const userIds = await this.favoritesService.getApplicationFavorites(parsed.data.applicationId);

    const response: ApplicationFavoritesResponse = {
      applicationId: parsed.data.applicationId,
      userIds,
      total: userIds.length,
    };

    logger.info("Application favorites retrieved successfully", {
      applicationId: parsed.data.applicationId,
      count: userIds.length,
    });
    res.status(200).json(response);
  };

  getApplicationFavoritesCount = async (req: Request, res: Response): Promise<void> => {
    const parsed = ApplicationFavoritesParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      logger.warn("Invalid path parameters", { errors: parsed.error.issues });
      throw parsed.error;
    }

    logger.debug("Fetching application favorites count", {
      applicationId: parsed.data.applicationId,
    });

    const count = await this.favoritesService.getApplicationFavoritesCount(parsed.data.applicationId);

    const response: ApplicationFavoritesCountResponse = {
      applicationId: parsed.data.applicationId,
      count,
    };

    logger.info("Application favorites count retrieved successfully", response);
    res.status(200).json(response);
  };

  deleteFavorite = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(res);

    const parsed = DeleteFavoriteParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      logger.warn("Invalid path parameters", { errors: parsed.error.issues });
      throw parsed.error;
    }

    logger.debug("Deleting favorite", { userId, applicationId: parsed.data.applicationId });

    const favorite = await this.favoritesService.deleteFavorite(
      userId,
      parsed.data.applicationId
    );

    logger.info("Favorite deleted successfully", { userId, applicationId: parsed.data.applicationId });
    res.status(200).json(favorite);
  };
}
