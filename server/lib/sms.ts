import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export interface SmsProvider {
  sendSms(to: string, message: string): Promise<void>;
}

class TwilioSmsProvider implements SmsProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || "";
  }

  async sendSms(to: string, message: string): Promise<void> {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      console.log(`[SMS - DEV MODE] Would send to ${to}: ${message}`);
      return;
    }

    const twilio = require("twilio")(this.accountSid, this.authToken);

    try {
      await twilio.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });
      console.log(`SMS sent successfully to ${to}`);
    } catch (error) {
      console.error("Failed to send SMS:", error);
      throw new Error("Failed to send SMS");
    }
  }
}

export const smsProvider = new TwilioSmsProvider();

export function normalizePhoneNumber(phone: string, defaultCountry: CountryCode = "US"): string | null {
  try {
    // First try to validate with default country code
    if (!isValidPhoneNumber(phone, defaultCountry)) {
      // If that fails, try without country code (for international numbers with +)
      if (!isValidPhoneNumber(phone)) {
        return null;
      }
    }
    
    // Parse with default country to handle numbers without + prefix
    const parsed = parsePhoneNumber(phone, defaultCountry);
    return parsed.format("E.164");
  } catch {
    return null;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
