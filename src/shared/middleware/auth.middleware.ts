import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());

// Configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:3001", // Next.js client origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);