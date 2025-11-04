import cors from "cors";

// Export CORS middleware configuration
export const corsMiddleware = cors({
  origin: "http://localhost:3000", // Next.js client origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Specify allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
});