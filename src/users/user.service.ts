import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { assertOwnershipOrAdmin } from '@/shared/utils/auth.utils.js';
import { user } from './user.model.js';
import type { UserResponse } from './dto/index.js';

export interface IUserService {
  acceptTos(email: string, actorUserId: string, actorRole: string): Promise<UserResponse>;
}

export default class UserService implements IUserService {
  constructor(private readonly db: NodePgDatabase) {}

  acceptTos = async (
    email: string,
    actorUserId: string,
    actorRole: string,
  ): Promise<UserResponse> => {
    const [existingUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!existingUser) {
      throw new HttpError(404, 'User not found', 'NOT_FOUND');
    }

    assertOwnershipOrAdmin(actorUserId, existingUser.id, actorRole);

    const now = new Date();
    const [updatedUser] = await this.db
      .update(user)
      .set({
        tosAccepted: true,
        tosAcceptedAt: existingUser.tosAcceptedAt ?? now,
      })
      .where(eq(user.id, existingUser.id))
      .returning();

    return updatedUser;
  };
}
