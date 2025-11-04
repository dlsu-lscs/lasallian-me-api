// User API routes
import { Router } from 'express';
import { getUserByEmail } from './user.controller.js';

const router = Router();

// GET /api/users/:email
router.get('/:email', getUserByEmail);

export default router;
