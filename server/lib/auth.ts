import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.warn("ADMIN_PASSWORD not set in environment variables");
    return false;
  }
  return password === adminPassword;
}
