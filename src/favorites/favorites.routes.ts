import { Router } from "express";
import { db } from "@/shared/config/database.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import FavoritesController from "./favorites.controller.js";
import FavoritesService from "./favorites.service.js";
import { requireApiKey } from "@/shared/middleware/auth.middleware.js";

const router = Router();

const favoritesService = new FavoritesService(db);
const favoritesController = new FavoritesController(favoritesService);

router.get("/users/:userId", favoritesController.getUserFavorites);
router.get("/applications/:applicationId/count", favoritesController.getApplicationFavoritesCount);
router.get("/applications/:applicationId", favoritesController.getApplicationFavorites);
router.post("/", requireApiKey,favoritesController.createFavorite);
router.delete("/:userId/:applicationId", requireApiKey, favoritesController.deleteFavorite);

export default router;
