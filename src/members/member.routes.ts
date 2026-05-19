import { Router } from 'express';
import { MemberController } from './member.controller.js';
import MemberService from './member.service.js';
import { requireAuth, requireRole } from '@/shared/middleware/auth.middleware.js';
import { db } from '@/shared/config/database.js';

const router = Router();

const memberService = new MemberService(db);
const memberController = new MemberController(memberService);

/**
 * @route GET /api/members
 * @description List members with pagination, search, filter, and sort
 * @access Private (Admin only)
 */
router.get('/', requireAuth, requireRole('admin'), memberController.getMembers);

/**
 * @route GET /api/members/:userId/applications
 * @description Get all applications for a specific user
 * @access Private (Admin only)
 */
router.get(
  '/:userId/applications',
  requireAuth,
  requireRole('admin'),
  memberController.getUserApplications,
);

/**
 * @route GET /api/members/:userId/reviews
 * @description Get all reviews written by a specific user
 * @access Private (Admin only)
 */
router.get(
  '/:userId/reviews',
  requireAuth,
  requireRole('admin'),
  memberController.getUserReviews,
);

/**
 * @route PATCH /api/members/:userId/ban
 * @description Ban a member with a reason
 * @access Private (Admin only)
 */
router.patch('/:userId/ban', requireAuth, requireRole('admin'), memberController.banMember);

/**
 * @route PATCH /api/members/:userId/unban
 * @description Unban a member
 * @access Private (Admin only)
 */
router.patch('/:userId/unban', requireAuth, requireRole('admin'), memberController.unbanMember);

/**
 * @route PATCH /api/members/:userId/promote
 * @description Promote a member to admin
 * @access Private (Admin only)
 */
router.patch('/:userId/promote', requireAuth, requireRole('admin'), memberController.promoteMember);

/**
 * @route PATCH /api/members/:userId/demote
 * @description Demote an admin to regular member
 * @access Private (Admin only)
 */
router.patch('/:userId/demote', requireAuth, requireRole('admin'), memberController.demoteMember);

export default router;
