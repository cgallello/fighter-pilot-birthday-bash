import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../lib/auth";
import { validateRequest } from "../lib/validation";
import { z } from "zod";

const router = Router();

const updateSettingsSchema = z.object({
  eventTitle: z.string().optional(),
  eventDescription: z.string().optional(),
});

// Get settings
router.get("/", async (req, res) => {
  try {
    const title = await storage.getSetting("EVENT_TITLE");
    const description = await storage.getSetting("EVENT_DESCRIPTION");
    
    res.json({
      eventTitle: title?.value || "OPERATION: THIRTY-FIVE",
      eventDescription: description?.value || "Mission Briefing: You are cleared for the ultimate birthday celebration.",
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update settings (admin only)
router.post("/", requireAdmin, validateRequest(updateSettingsSchema), async (req, res) => {
  try {
    const { eventTitle, eventDescription } = req.body;
    
    if (eventTitle) {
      await storage.upsertSetting({ key: "EVENT_TITLE", value: eventTitle });
    }
    
    if (eventDescription) {
      await storage.upsertSetting({ key: "EVENT_DESCRIPTION", value: eventDescription });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
