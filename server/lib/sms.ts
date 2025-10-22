import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export function normalizePhoneNumber(phone: string, defaultCountry: CountryCode = "US"): string | null {
  try {
    console.log(`[PHONE_VALIDATION] Attempting to validate phone: "${phone}" with country: ${defaultCountry}`);

    // First try strict validation
    const isValidWithCountry = isValidPhoneNumber(phone, defaultCountry);
    console.log(`[PHONE_VALIDATION] Is valid with ${defaultCountry}: ${isValidWithCountry}`);

    if (isValidWithCountry) {
      // Parse with default country to handle numbers without + prefix
      const parsed = parsePhoneNumber(phone, defaultCountry);
      const formatted = parsed.format("E.164");
      console.log(`[PHONE_VALIDATION] Phone "${phone}" formatted to: ${formatted}`);
      return formatted;
    }

    // If strict validation fails, try without country code (for international numbers with +)
    const isValidWithoutCountry = isValidPhoneNumber(phone);
    console.log(`[PHONE_VALIDATION] Is valid without country: ${isValidWithoutCountry}`);

    if (isValidWithoutCountry) {
      const parsed = parsePhoneNumber(phone);
      const formatted = parsed.format("E.164");
      console.log(`[PHONE_VALIDATION] Phone "${phone}" formatted to: ${formatted}`);
      return formatted;
    }

    // Fallback: Check if it looks like a US phone number pattern and allow it for demo/testing
    const cleanPhone = phone.replace(/[^\d]/g, '');
    console.log(`[PHONE_VALIDATION] Cleaned phone: ${cleanPhone}`);

    if (cleanPhone.length === 10) {
      // Format as US number: +1XXXXXXXXXX
      const formatted = `+1${cleanPhone}`;
      console.log(`[PHONE_VALIDATION] Phone "${phone}" accepted as demo format: ${formatted}`);
      return formatted;
    }

    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      // Already has country code
      const formatted = `+${cleanPhone}`;
      console.log(`[PHONE_VALIDATION] Phone "${phone}" accepted as demo format: ${formatted}`);
      return formatted;
    }

    console.log(`[PHONE_VALIDATION] Phone "${phone}" rejected - doesn't match any valid pattern`);
    return null;
  } catch (error) {
    console.log(`[PHONE_VALIDATION] Error parsing phone "${phone}":`, error);
    return null;
  }
}
