import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("[VALIDATION] Original req.body:", JSON.stringify(req.body, null, 2));
      const parsed = schema.parse(req.body);
      console.log("[VALIDATION] Parsed result:", JSON.stringify(parsed, null, 2));
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        res.status(400).json({ error: "Invalid request" });
      }
    }
  };
}
