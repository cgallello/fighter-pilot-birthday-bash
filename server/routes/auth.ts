import { Router } from "express";
import { storage } from "../storage";
import { validateRequest } from "../lib/validation";
import { rateLimitAuth } from "../lib/rateLimit";
import { normalizePhoneNumber } from "../lib/sms";
import { generateEditToken, verifyEditToken } from "../lib/tokens";
import { z } from "zod";

const router = Router();

const phoneLoginSchema = z.object({
  phone: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  plusOnes: z.number().min(1).max(11).optional(),
}).partial();


// Phone number login (no SMS required)
router.post("/phone-login", rateLimitAuth, validateRequest(phoneLoginSchema), async (req, res) => {
  try {
    const { phone } = req.body;

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Find guest by phone number
    const guests = await storage.getAllGuests();
    const guest = guests.find(g => g.phone === normalized);

    if (!guest) {
      return res.status(404).json({ error: "No registration found for this phone number" });
    }

    // Generate edit token
    const editToken = generateEditToken(guest.id);

    res.json({
      success: true,
      editToken,
      guest: {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        description: guest.description,
        plusOnes: guest.plusOnes
      }
    });
  } catch (error) {
    console.error("Phone login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify session and get guest data with RSVPs
router.post("/verify-session", async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const payload = verifyEditToken(token);

    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get guest data
    const guest = await storage.getGuest(payload.guestId);
    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    // Get guest RSVPs
    const rsvps = await storage.getRsvpsByGuest(payload.guestId);

    res.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        description: guest.description,
        plusOnes: guest.plusOnes
      },
      rsvps: rsvps.filter(r => r.status === "JOINED")
    });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Update profile (phone and plusOnes)
router.post("/update-profile", validateRequest(updateProfileSchema), async (req, res) => {
  console.log("[UPDATE PROFILE] Request received:", req.body);
  console.log("[UPDATE PROFILE] Full request body:", JSON.stringify(req.body, null, 2));
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const payload = verifyEditToken(token);

    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { name, phone, plusOnes } = req.body;

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      const normalized = normalizePhoneNumber(phone);
      if (!normalized) {
        return res.status(400).json({ error: "Invalid phone number" });
      }
      updateData.phone = normalized;
    }

    if (plusOnes !== undefined) {
      updateData.plusOnes = plusOnes;
    }

    // Update guest in database
    console.log("[UPDATE PROFILE] Updating guest ID:", payload.guestId, "with data:", updateData);
    const updatedGuest = await storage.updateGuest(payload.guestId, updateData);
    console.log("[UPDATE PROFILE] Updated guest result:", updatedGuest);

    if (!updatedGuest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json({
      success: true,
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        phone: updatedGuest.phone,
        description: updatedGuest.description,
        plusOnes: updatedGuest.plusOnes
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
