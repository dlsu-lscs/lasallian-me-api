import { Router } from 'express';
import { db } from '@/shared/config/database.js';
import { requireAuth } from '@/shared/middleware/auth.middleware.js';
import RatingsController from './ratings.controller.js';
import RatingsService from './ratings.service.js';

const router = Router();

const ratingsService = new RatingsService(db);
const ratingsController = new RatingsController(ratingsService);

router.get('/applications/:slug/ratings', ratingsController.getApplicationRatings);
router.post('/applications/:slug/ratings', requireAuth, ratingsController.createRating);
router.patch('/applications/:slug/ratings', requireAuth, ratingsController.patchRating);
router.delete('/applications/:slug/ratings', requireAuth, ratingsController.deleteRating);

export default router;
