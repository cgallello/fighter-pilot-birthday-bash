import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
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
