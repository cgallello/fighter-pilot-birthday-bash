import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import helmet from "helmet";
import adminRoutes from "./routes/admin";
import settingsRoutes from "./routes/settings";
import eventsRoutes from "./routes/events";
import guestsRoutes from "./routes/guests";
import rsvpRoutes from "./routes/rsvp";
import authRoutes from "./routes/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable for Vite dev mode
    })
  );

  // Session management
  const sessionSecret = process.env.SESSION_SECRET || "fallback-secret-change-in-production";
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Register API routes
  app.use("/api/admin", adminRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/guests", guestsRoutes);
  app.use("/api/rsvp", rsvpRoutes);
  app.use("/api/auth", authRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
