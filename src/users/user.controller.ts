import type { Request, Response } from 'express';
import type { IUserService } from './user.service.js';
import { UserEmailParamsSchema, UserResponseSchema } from './dto/index.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { logger } from '@/shared/utils/logger.js';

export class UserController {
  constructor(private readonly userService: IUserService) {}

  acceptTos = async (req: Request, res: Response): Promise<void> => {
    const { email } = UserEmailParamsSchema.parse(req.params);
    const authUserId = this.getAuthUserId(res);
    const authUserRole = this.getAuthUserRole(res);

    logger.debug('Accepting terms of service for user', { email, authUserId });

    const updatedUser = await this.userService.acceptTos(email, authUserId, authUserRole);

    logger.info('Terms of service accepted successfully', { email, authUserId });

    const parsed = UserResponseSchema.parse(updatedUser);
    res.status(200).json(parsed);
  };

  private getAuthUserId(res: Response): string {
    const authUserId = res.locals.authUserId as string | undefined;
    if (!authUserId) throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
    return authUserId;
  }

  private getAuthUserRole(res: Response): string {
    const authUserRole = res.locals.authUserRole as string | undefined;
    if (!authUserRole) throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
    return authUserRole;
  }
}
export default UserController;
