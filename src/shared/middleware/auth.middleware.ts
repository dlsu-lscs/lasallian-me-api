import cors from "cors";
import {Request, Response, NextFunction} from "express"
import { HttpError } from "@/shared/middleware/error.middleware.js"
import { auth } from '@/auth/auth.config.js';
import { fromNodeHeaders } from "better-auth/node";

// Export CORS middleware configuration
export const corsMiddleware = cors({
  origin: process.env.CLIENT_URL, // Next.js client origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Specify allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
});

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => 
{
  const apiKey = req.headers["x-api-key"]

  if(!apiKey || apiKey !== process.env.API_SECRET_KEY)
  {
    throw new HttpError(401, "Unauthorized", "UNAUTHORIZED")
  }
  next()
}

export const requireAuth = async(req: Request, res: Response, next: NextFunction) =>
{
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  })
  
  if (!session) {
    throw new HttpError(401, "Unauthorized", "UNAUTHORIZED")
  }

  next()
}