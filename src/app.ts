// Express app configuration (no listen)
import express from "express";
import authRoutes from "./auth/auth.routes.js";
//import userRoutes from "./users/user.routes.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
//app.use('/api/users', userRoutes);

export default app;