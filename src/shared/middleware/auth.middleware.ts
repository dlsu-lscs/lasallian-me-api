import cors from "cors";

// Export CORS middleware configuration
export const corsMiddleware = cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Next.js client origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Specify allowed HTTP methods
  credentials: true, 
});