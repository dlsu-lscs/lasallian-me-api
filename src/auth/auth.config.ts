import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../shared/config/database.js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});