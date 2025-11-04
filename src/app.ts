// Express app configuration (no listen)
import express from "express";
import { corsMiddleware } from "./shared/middleware/auth.middleware.js";
import authRoutes from "./auth/auth.routes.js";
//import userRoutes from "./users/user.routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware); // Apply CORS middleware

// Routes
app.use('/api/auth', authRoutes);
//app.use('/api/users', userRoutes);

export default app;