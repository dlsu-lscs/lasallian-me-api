// Express app configuration (no listen)
import express from "express";
import { corsMiddleware } from "./shared/middleware/auth.middleware.js";

// Register OpenAPI routes BEFORE importing swagger routes
import "./applications/application.openapi.js";

import authRoutes from "./auth/auth.routes.js";
import userRoutes from "./users/user.routes.js";
import applicationRoutes from "./applications/application.routes.js";
import swaggerRoutes from "./shared/routes/swagger.routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware); // Apply CORS middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// API Documentation (mounted last)
app.use('/api-docs', swaggerRoutes);

export default app;