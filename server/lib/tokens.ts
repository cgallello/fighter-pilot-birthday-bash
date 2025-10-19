import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const EDIT_TOKEN_TTL = 24 * 60 * 60; // 24 hours in seconds

interface EditTokenPayload {
  guestId: string;
  scope: "edit-profile";
}

export function generateEditToken(guestId: string): string {
  const payload: EditTokenPayload = {
    guestId,
    scope: "edit-profile",
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EDIT_TOKEN_TTL });
}

export function verifyEditToken(token: string): EditTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as EditTokenPayload;
    
    if (payload.scope !== "edit-profile") {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
