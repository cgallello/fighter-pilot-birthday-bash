import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../lib/auth";
import { validateRequest } from "../lib/validation";
import { insertEventBlockSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all event blocks
router.get("/", async (req, res) => {
  try {
    const blocks = await storage.getAllEventBlocks();
    
    // Group by plan type
    const fair = blocks.filter((b) => b.planType === "FAIR");
    const rain = blocks.filter((b) => b.planType === "RAIN");
    
    res.json({ fair, rain });
  } catch (error) {
    console.error("Get event blocks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create event block (admin only)
router.post("/", requireAdmin, validateRequest(insertEventBlockSchema), async (req, res) => {
  try {
    console.log("Received event data:", JSON.stringify(req.body, null, 2));
    console.log("startTime type:", typeof req.body.startTime, req.body.startTime);
    console.log("endTime type:", typeof req.body.endTime, req.body.endTime);
    const block = await storage.createEventBlock(req.body);
    res.json(block);
  } catch (error) {
    console.error("Create event block error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update event block (admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await storage.updateEventBlock(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ error: "Event block not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Update event block error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete event block (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await storage.deleteEventBlock(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete event block error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reorder event blocks (admin only)
const reorderSchema = z.object({
  blocks: z.array(z.object({
    id: z.string(),
    sortOrder: z.number(),
  })),
});

router.put("/reorder", requireAdmin, validateRequest(reorderSchema), async (req, res) => {
  try {
    await storage.reorderEventBlocks(req.body.blocks);
    res.json({ success: true });
  } catch (error) {
    console.error("Reorder event blocks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
