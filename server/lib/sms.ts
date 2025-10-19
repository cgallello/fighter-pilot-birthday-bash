import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
import twilio from "twilio";

export interface SmsProvider {
  sendVerification(to: string): Promise<{ success: boolean; error?: string }>;
  checkVerification(to: string, code: string): Promise<{ success: boolean; error?: string }>;
}

interface TwilioCredentials {
  accountSid: string;
  apiKey: string;
  apiKeySecret: string;
  phoneNumber: string;
  verifyServiceSid?: string;
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
      phoneNumber: connectionSettings.settings.phone_number,
      verifyServiceSid: connectionSettings.settings.verify_service_sid || process.env.TWILIO_VERIFY_SERVICE_SID
    };
  } catch (error) {
    console.error("[Twilio Debug] Failed to fetch Twilio credentials:", error);
    return null;
  }
}

class TwilioSmsProvider implements SmsProvider {
  async sendVerification(to: string): Promise<{ success: boolean; error?: string }> {
    console.log('[Twilio Verify] Sending verification to:', to);
    try {
      const credentials = await getTwilioCredentials();
      
      if (!credentials) {
        console.log(`[SMS - DEV MODE] Would send verification code to ${to}`);
        return { success: true };
      }

      if (!credentials.verifyServiceSid) {
        console.error('[Twilio Verify] Missing Verify Service SID');
        return { success: false, error: 'Twilio Verify not configured' };
      }

      const twilioClient = twilio(credentials.apiKey, credentials.apiKeySecret, {
        accountSid: credentials.accountSid
      });

      const verification = await twilioClient.verify.v2
        .services(credentials.verifyServiceSid)
        .verifications
        .create({ 
          to: to,
          channel: 'sms'
        });

      console.log('[Twilio Verify] Verification sent! Status:', verification.status, 'SID:', verification.sid);
      return { success: true };
    } catch (error: any) {
      console.error("[Twilio Verify] Failed to send verification:", error);
      return { success: false, error: error.message || 'Failed to send verification' };
    }
  }

  async checkVerification(to: string, code: string): Promise<{ success: boolean; error?: string }> {
    console.log('[Twilio Verify] Checking verification for:', to);
    try {
      const credentials = await getTwilioCredentials();
      
      if (!credentials) {
        console.log(`[SMS - DEV MODE] Would verify code ${code} for ${to}`);
        return { success: true };
      }

      if (!credentials.verifyServiceSid) {
        console.error('[Twilio Verify] Missing Verify Service SID');
        return { success: false, error: 'Twilio Verify not configured' };
      }

      const twilioClient = twilio(credentials.apiKey, credentials.apiKeySecret, {
        accountSid: credentials.accountSid
      });

      const verificationCheck = await twilioClient.verify.v2
        .services(credentials.verifyServiceSid)
        .verificationChecks
        .create({ 
          to: to,
          code: code
        });

      console.log('[Twilio Verify] Verification check status:', verificationCheck.status);
      
      if (verificationCheck.status === 'approved') {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid or expired code' };
      }
    } catch (error: any) {
      console.error("[Twilio Verify] Failed to check verification:", error);
      return { success: false, error: error.message || 'Verification failed' };
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
