import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const SMS_RATE_LIMITER = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60, // 1 hour
});

const AUTH_RATE_LIMITER = new RateLimiterMemory({
  points: 10,
  duration: 60 * 15, // 15 minutes
});

export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SECRET || "default-secret";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

export function rateLimitSms(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown";
  const phone = req.body.phone || "";
  const key = `sms:${hashIp(ip)}:${phone}`;

  SMS_RATE_LIMITER.consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ error: "Too many requests. Please try again later." });
    });
}

export function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown";
  const key = `auth:${hashIp(ip)}`;

  AUTH_RATE_LIMITER.consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ error: "Too many requests. Please try again later." });
    });
}
