import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export interface SmsProvider {
  sendSms(to: string, message: string): Promise<void>;
}

interface TwilioCredentials {
  accountSid: string;
  apiKey: string;
  apiKeySecret: string;
  phoneNumber: string;
}

async function getTwilioCredentials(): Promise<TwilioCredentials | null> {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!hostname || !xReplitToken) {
      return null;
    }

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    const data = await response.json();
    const connectionSettings = data.items?.[0];

    if (!connectionSettings || !connectionSettings.settings.account_sid || 
        !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret) {
      return null;
    }

    return {
      accountSid: connectionSettings.settings.account_sid,
      apiKey: connectionSettings.settings.api_key,
      apiKeySecret: connectionSettings.settings.api_key_secret,
      phoneNumber: connectionSettings.settings.phone_number
    };
  } catch (error) {
    console.error("Failed to fetch Twilio credentials:", error);
    return null;
  }
}

class TwilioSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string): Promise<void> {
    const credentials = await getTwilioCredentials();
    
    if (!credentials) {
      console.log(`[SMS - DEV MODE] Would send to ${to}: ${message}`);
      return;
    }

    const twilio = require("twilio")(credentials.apiKey, credentials.apiKeySecret, {
      accountSid: credentials.accountSid
    });

    try {
      await twilio.messages.create({
        body: message,
        from: credentials.phoneNumber,
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
