import { betterAuth } from "better-auth"; // [1]
import { prismaAdapter } from "better-auth/adapters/prisma"; // [2]
import { prisma } from "./prisma.js"; // [2]
import "dotenv/config"; // [3]

// Parse trusted origins from environment variables to allow cross-origin requests
const trustedOrigins = process.env.TRUSTED_ORIGINS 
  ? process.env.TRUSTED_ORIGINS.split(",") 
  : []; // [3]

export const auth = betterAuth({
  // Configure Database Adapter
  database: prismaAdapter(prisma, {
    provider: "postgresql", // [4]
  }),

  // Enable Email & Password Authentication
  emailAndPassword: {
    enabled: true, // [5]
  },

  // Enable User Management Features
  user: {
    deleteUser: {
      enabled: true, // [6]
    },
  },

  // CORS and Security Configuration
  trustedOrigins: trustedOrigins, // [3]
  baseURL: process.env.BETTER_AUTH_URL, // [4]
  secret: process.env.BETTER_AUTH_SECRET, // [1]

  // Advanced Cookie Settings for Production vs Development
  advanced: {
    cookies: {
      sessionToken: {
        attributes: {
          httpOnly: true, // [7]
          // Secure cookies only in production
          secure: process.env.NODE_ENV === "production", // [7]
          // 'None' for cross-site usage in production (HTTPS), 'Lax' for local development
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // [8]
          path: "/", // [7]
        },
      },
    },
  },
});
