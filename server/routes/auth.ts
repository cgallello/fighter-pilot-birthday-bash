import { Router } from "express";
import { storage } from "../storage";
import { validateRequest } from "../lib/validation";
import { rateLimitSms } from "../lib/rateLimit";
import { smsProvider, normalizePhoneNumber, generateVerificationCode } from "../lib/sms";
import { generateEditToken, verifyEditToken } from "../lib/tokens";
import { hashIp } from "../lib/rateLimit";
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
    
    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const ipHash = hashIp(req.ip || "unknown");
    
    // Store verification code
    await storage.createVerificationCode({
      guestId,
      phone: phoneToVerify,
      code,
      purpose: "EDIT_PROFILE",
      expiresAt,
      ipHash,
      attemptCount: 0,
      consumedAt: null,
    });
    
    // Send SMS
    const message = `Your verification code for Operation: Thirty-Five is ${code}. Valid for 10 minutes.`;
    await smsProvider.sendSms(phoneToVerify, message);
    
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
    
    // Get latest verification code
    const verificationCode = await storage.getLatestVerificationCode(guestId, "EDIT_PROFILE");
    
    if (!verificationCode) {
      return res.status(400).json({ error: "No verification code found. Please request a new code." });
    }
    
    // Check if already consumed
    if (verificationCode.consumedAt) {
      return res.status(400).json({ error: "Code already used. Please request a new code." });
    }
    
    // Check if expired
    if (new Date() > verificationCode.expiresAt) {
      return res.status(400).json({ error: "Code expired. Please request a new code." });
    }
    
    // Check attempt count
    if (verificationCode.attemptCount >= 5) {
      return res.status(400).json({ error: "Too many attempts. Please request a new code." });
    }
    
    // Verify code
    if (verificationCode.code !== code) {
      await storage.incrementAttemptCount(verificationCode.id);
      return res.status(400).json({ error: "Invalid code. Please try again." });
    }
    
    // Mark as consumed
    await storage.markCodeAsConsumed(verificationCode.id);
    
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
