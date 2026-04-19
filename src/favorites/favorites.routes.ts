import { Router } from "express";
import { db } from "@/shared/config/database.js";
import { requireAuth } from "@/shared/middleware/auth.middleware.js";
import FavoritesController from "./favorites.controller.js";
import FavoritesService from "./favorites.service.js";

const router = Router();

const favoritesService = new FavoritesService(db);
const favoritesController = new FavoritesController(favoritesService);

router.get("/users/:userId", favoritesController.getUserFavorites);
router.get("/applications/:applicationId/count", favoritesController.getApplicationFavoritesCount);
router.get("/applications/:applicationId", favoritesController.getApplicationFavorites);
router.post("/", requireAuth, favoritesController.createFavorite);
router.delete("/:applicationId", requireAuth, favoritesController.deleteFavorite);

export default router;
