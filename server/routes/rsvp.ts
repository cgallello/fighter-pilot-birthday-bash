import { Router } from "express";
import { storage } from "../storage";
import { validateRequest } from "../lib/validation";
import { z } from "zod";

const router = Router();

const rsvpSchema = z.object({
  guestId: z.string(),
  eventBlockId: z.string(),
  status: z.enum(["JOINED", "DECLINED"]),
});

// Upsert RSVP
router.post("/", validateRequest(rsvpSchema), async (req, res) => {
  try {
    const { guestId, eventBlockId, status } = req.body;
    
    // Verify guest exists
    const guest = await storage.getGuest(guestId);
    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }
    
    // Verify event exists
    const event = await storage.getEventBlock(eventBlockId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const rsvp = await storage.upsertRsvp({ guestId, eventBlockId, status });
    res.json(rsvp);
  } catch (error) {
    console.error("RSVP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get guest RSVPs
router.get("/guest/:guestId", async (req, res) => {
  try {
    const rsvps = await storage.getRsvpsByGuest(req.params.guestId);
    res.json(rsvps);
  } catch (error) {
    console.error("Get RSVPs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
