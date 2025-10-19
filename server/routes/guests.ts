import { Router } from "express";
import { storage } from "../storage";
import { validateRequest } from "../lib/validation";
import { insertGuestSchema } from "@shared/schema";
import { normalizePhoneNumber } from "../lib/sms";

const router = Router();

// Create guest
router.post("/", validateRequest(insertGuestSchema), async (req, res) => {
  try {
    const { name, phone, description } = req.body;
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    if (!normalizedPhone) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    
    // Check if guest with this phone already exists
    const existing = await storage.getGuestByPhone(normalizedPhone);
    
    if (existing) {
      return res.json(existing);
    }
    
    const guest = await storage.createGuest({
      name,
      phone: normalizedPhone,
      description: description || null,
    });
    
    res.json(guest);
  } catch (error) {
    console.error("Create guest error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get guest
router.get("/:id", async (req, res) => {
  try {
    const guest = await storage.getGuest(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }
    
    res.json(guest);
  } catch (error) {
    console.error("Get guest error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
