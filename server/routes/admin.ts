import { Router } from "express";
import { storage } from "../storage";
import { verifyAdminPassword, requireAdmin } from "../lib/auth";
import { validateRequest } from "../lib/validation";
import { rateLimitAuth } from "../lib/rateLimit";
import { z } from "zod";

const router = Router();

// Login
const loginSchema = z.object({
  password: z.string(),
});

router.post("/login", rateLimitAuth, validateRequest(loginSchema), async (req, res) => {
  try {
    const { password } = req.body;

    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    req.session.isAdmin = true;
    res.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check admin session
router.get("/session", async (req, res) => {
  if (req.session?.isAdmin) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
router.post("/logout", requireAdmin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

// Get all guests
router.get("/guests", requireAdmin, async (req, res) => {
  try {
    const guests = await storage.getAllGuests();
    res.json(guests);
  } catch (error) {
    console.error("Get guests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all RSVPs with guest info
router.get("/rsvps", requireAdmin, async (req, res) => {
  try {
    const rsvps = await storage.getAllRsvpsWithGuests();
    res.json(rsvps);
  } catch (error) {
    console.error("Get RSVPs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
