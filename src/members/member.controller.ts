import type { Request, Response } from 'express';
import type { IMemberService } from './member.service.js';
import {
  MembersListQuerySchema,
  MembersListResponseSchema,
  BanMemberRequestSchema,
  MemberUserIdParamsSchema,
  UserApplicationsListResponseSchema,
  MemberReviewsListResponseSchema,
} from './dto/index.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { logger } from '@/shared/utils/logger.js';

export class MemberController {
  constructor(private readonly memberService: IMemberService) {}

  getMembers = async (req: Request, res: Response): Promise<void> => {
    const { limit, page, ...filters } = MembersListQuerySchema.parse(req.query);

    const response = await this.memberService.getMembers(limit, page, filters);

    logger.info('Members retrieved', { count: response.data.length, total: response.meta.total });

    const parsed = MembersListResponseSchema.parse(response);
    res.status(200).json(parsed);
  };

  getUserApplications = async (req: Request, res: Response): Promise<void> => {
    const { userId } = MemberUserIdParamsSchema.parse(req.params);

    const response = await this.memberService.getUserApplications(userId);

    const parsed = UserApplicationsListResponseSchema.parse(response);
    res.status(200).json(parsed);
  };

  getUserReviews = async (req: Request, res: Response): Promise<void> => {
    const { userId } = MemberUserIdParamsSchema.parse(req.params);

    const response = await this.memberService.getUserReviews(userId);

    const parsed = MemberReviewsListResponseSchema.parse(response);
    res.status(200).json(parsed);
  };

  banMember = async (req: Request, res: Response): Promise<void> => {
    const { userId } = MemberUserIdParamsSchema.parse(req.params);
    const { reason } = BanMemberRequestSchema.parse(req.body);
    const actorUserId = this.getAuthUserId(res);

    await this.memberService.banMember(userId, reason, actorUserId);

    logger.info('Member banned', { targetUserId: userId, actorUserId });
    res.status(204).send();
  };

  unbanMember = async (req: Request, res: Response): Promise<void> => {
    const { userId } = MemberUserIdParamsSchema.parse(req.params);
    const actorUserId = this.getAuthUserId(res);

    await this.memberService.unbanMember(userId, actorUserId);

    logger.info('Member unbanned', { targetUserId: userId, actorUserId });
    res.status(204).send();
  };

  promoteMember = async (req: Request, res: Response): Promise<void> => {
    const { userId } = MemberUserIdParamsSchema.parse(req.params);
    const actorUserId = this.getAuthUserId(res);

    await this.memberService.promoteMember(userId, actorUserId);

    logger.info('Member promoted to admin', { targetUserId: userId, actorUserId });
    res.status(204).send();
  };

  demoteMember = async (req: Request, res: Response): Promise<void> => {
    const { userId } = MemberUserIdParamsSchema.parse(req.params);
    const actorUserId = this.getAuthUserId(res);

    await this.memberService.demoteMember(userId, actorUserId);

    logger.info('Member demoted from admin', { targetUserId: userId, actorUserId });
    res.status(204).send();
  };

  private getAuthUserId(res: Response): string {
    const authUserId = res.locals.authUserId as string | undefined;
    if (!authUserId) throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
    return authUserId;
  }
}
