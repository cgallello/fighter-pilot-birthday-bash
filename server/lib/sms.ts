import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
import twilio from "twilio";

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

    console.log('[Twilio Debug] Hostname:', hostname ? 'Found' : 'Missing');
    console.log('[Twilio Debug] Token:', xReplitToken ? 'Found' : 'Missing');

    if (!hostname || !xReplitToken) {
      console.log('[Twilio Debug] Missing credentials, returning null');
      return null;
    }

    const url = 'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio';
    console.log('[Twilio Debug] Fetching from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });

    console.log('[Twilio Debug] Response status:', response.status);

    const data = await response.json();
    console.log('[Twilio Debug] Response data:', JSON.stringify(data, null, 2));

    const connectionSettings = data.items?.[0];

    if (!connectionSettings) {
      console.log('[Twilio Debug] No connection settings found');
      return null;
    }

    console.log('[Twilio Debug] Settings available:', {
      hasAccountSid: !!connectionSettings.settings?.account_sid,
      hasApiKey: !!connectionSettings.settings?.api_key,
      hasApiKeySecret: !!connectionSettings.settings?.api_key_secret,
      hasPhoneNumber: !!connectionSettings.settings?.phone_number
    });

    if (!connectionSettings.settings.account_sid || 
        !connectionSettings.settings.api_key || 
        !connectionSettings.settings.api_key_secret) {
      console.log('[Twilio Debug] Missing required settings');
      return null;
    }

    console.log('[Twilio Debug] Successfully retrieved credentials');
    return {
      accountSid: connectionSettings.settings.account_sid,
      apiKey: connectionSettings.settings.api_key,
      apiKeySecret: connectionSettings.settings.api_key_secret,
      phoneNumber: connectionSettings.settings.phone_number
    };
  } catch (error) {
    console.error("[Twilio Debug] Failed to fetch Twilio credentials:", error);
    return null;
  }
}

class TwilioSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string): Promise<void> {
    console.log('[Twilio Debug] sendSms called for:', to);
    try {
      const credentials = await getTwilioCredentials();
      
      if (!credentials) {
        console.log(`[SMS - DEV MODE] Would send to ${to}: ${message}`);
        return;
      }

      console.log('[Twilio Debug] Creating Twilio client...');
      const twilioClient = twilio(credentials.apiKey, credentials.apiKeySecret, {
        accountSid: credentials.accountSid
      });

      console.log('[Twilio Debug] Sending message from:', credentials.phoneNumber, 'to:', to);
      const result = await twilioClient.messages.create({
        body: message,
        from: credentials.phoneNumber,
        to: to,
      });
      console.log('[Twilio Debug] SMS sent successfully! SID:', result.sid);
      console.log(`SMS sent successfully to ${to}`);
    } catch (error) {
      console.error("[Twilio Debug] Failed to send SMS:", error);
      // Log to console instead of sending SMS in dev mode if Twilio fails
      console.log(`[SMS - FALLBACK] Would send to ${to}: ${message}`);
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
