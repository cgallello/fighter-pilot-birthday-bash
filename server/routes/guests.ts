import { Router } from "express";
import { storage } from "../storage";
import { validateRequest } from "../lib/validation";
import { insertGuestSchema } from "@shared/schema";
import { normalizePhoneNumber } from "../lib/sms";
import { generateEditToken } from "../lib/tokens";

const router = Router();

// Create guest
router.post("/", validateRequest(insertGuestSchema), async (req, res) => {
  try {
    const { name, phone, description, plusOnes } = req.body;
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    if (!normalizedPhone) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    
    // Check if guest with this phone already exists
    const existing = await storage.getGuestByPhone(normalizedPhone);

    if (existing) {
      // Phone number is already registered
      return res.status(409).json({
        error: "Phone number already registered",
        message: "This phone number is already associated with an account. Use the phone login option to access your existing registration."
      });
    }

    const guest = await storage.createGuest({
      name,
      phone: normalizedPhone,
      description: description || null,
      plusOnes: plusOnes || 1,
    });

    // Generate edit token for new guest
    const editToken = generateEditToken(guest.id);

    res.json({
      ...guest,
      editToken
    });
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
