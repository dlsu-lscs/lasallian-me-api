import { HttpError } from '../middleware/error.middleware.js';
export const assertOwnershipOrAdmin = (userId: string, objectId: string, role: string): void => {
  if (role === 'admin') {
    return;
  }

  if (userId !== objectId) {
    throw new HttpError(403, 'Forbidden', 'FORBIDDEN');
  }
};
