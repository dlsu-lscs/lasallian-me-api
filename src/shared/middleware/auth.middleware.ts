import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { auth } from '@/shared/auth/auth.config.js';
import { fromNodeHeaders } from 'better-auth/node';

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];

export const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept'],
});

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
  }
  next();
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const sessionUserId = session.user?.id;

  if (!sessionUserId) {
    throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const sessionUserRole = (session.user as { role?: string } | undefined)?.role;

  if (!sessionUserRole) {
    throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  res.locals.authUserId = sessionUserId;
  res.locals.authUserRole = sessionUserRole;

  next();
};

export const requireRole = (...roles: string[]) => {
  const allowedRoles = new Set(roles);

  return (req: Request, res: Response, next: NextFunction) => {
    const authUserRole = res.locals.authUserRole as string | undefined;

    if (!authUserRole || !allowedRoles.has(authUserRole)) {
      throw new HttpError(403, 'Forbidden', 'FORBIDDEN');
    }

    next();
  };
};

export const getSession = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  return session;
};
