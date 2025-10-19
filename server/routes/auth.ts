import { Router } from "express";
import { storage } from "../storage";
import { validateRequest } from "../lib/validation";
import { rateLimitSms } from "../lib/rateLimit";
import { smsProvider, normalizePhoneNumber } from "../lib/sms";
import { generateEditToken, verifyEditToken } from "../lib/tokens";
import { z } from "zod";

const router = Router();

const startSmsSchema = z.object({
  guestId: z.string(),
  phone: z.string().optional(),
});

const verifySmsSchema = z.object({
  guestId: z.string(),
  code: z.string().length(6),
});

const updateDescriptionSchema = z.object({
  description: z.string(),
});

// Start SMS verification
router.post("/sms/start", rateLimitSms, validateRequest(startSmsSchema), async (req, res) => {
  try {
    const { guestId, phone } = req.body;
    
    const guest = await storage.getGuest(guestId);
    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }
    
    let phoneToVerify = guest.phone;
    
    // If phone is provided, update guest's phone
    if (phone) {
      const normalized = normalizePhoneNumber(phone);
      if (!normalized) {
        return res.status(400).json({ error: "Invalid phone number" });
      }
      
      await storage.updateGuest(guestId, { phone: normalized });
      phoneToVerify = normalized;
    }
    
    // Send verification using Twilio Verify
    const result = await smsProvider.sendVerification(phoneToVerify);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error || "Failed to send verification code" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("SMS start error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify SMS code
router.post("/sms/verify", rateLimitSms, validateRequest(verifySmsSchema), async (req, res) => {
  try {
    const { guestId, code } = req.body;
    
    const guest = await storage.getGuest(guestId);
    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }
    
    // Verify code using Twilio Verify
    const result = await smsProvider.checkVerification(guest.phone, code);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || "Invalid code. Please try again." });
    }
    
    // Update guest as verified
    await storage.updateGuest(guestId, {
      phoneVerified: true,
      lastVerifiedAt: new Date(),
    });
    
    // Generate edit token
    const editToken = generateEditToken(guestId);
    
    res.json({ success: true, editToken });
  } catch (error) {
    console.error("SMS verify error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update guest description (requires edit token)
router.put("/guests/:id/description", validateRequest(updateDescriptionSchema), async (req, res) => {
  try {
    const guestId = req.params.id;
    const { description } = req.body;
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyEditToken(token);
    
    if (!payload || payload.guestId !== guestId) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
    const updated = await storage.updateGuest(guestId, { description });
    
    if (!updated) {
      return res.status(404).json({ error: "Guest not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Update description error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
