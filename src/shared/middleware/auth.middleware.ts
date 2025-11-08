import cors from "cors";

// Export CORS middleware configuration
export const corsMiddleware = cors({
  origin: process.env.CLIENT_URL, // Next.js client origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Specify allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
});