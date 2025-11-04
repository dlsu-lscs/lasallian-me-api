// User request handlers
import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { logger } from '@/shared/utils/logger.js';

const userService = new UserService();

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      logger.warn('Get user by email - missing email parameter');
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    logger.debug('Fetching user by email', { email });
    
    const user = await userService.getUserByEmail(email);
    
    if (!user) {
      logger.info('User not found', { email });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User retrieved successfully', { userId: user.id, email });
    
    return res.status(200).json(user);
    
  } catch (error) {
    logger.error('Error fetching user by email', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
