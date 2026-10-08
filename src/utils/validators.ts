/**
 * Analyzes whether a domain resembles an authentic Indian Government portal
 * Authentic government domains typically end with .gov.in or .nic.in
 */
export const isOfficialGovDomain = (url: string): boolean => {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsed.hostname.toLowerCase();
    return hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in');
  } catch {
    return false;
  }
};

/**
 * Checks for common fraudulent patterns in text
 */
export const detectScamKeywords = (text: string): string[] => {
  const flags: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes('registration fee') || lower.includes('processing fee') || lower.includes('deposit')) {
    flags.push('Upfront fee solicitation detected');
  }
  if (lower.includes('whatsapp') && (lower.includes('link') || lower.includes('send'))) {
    flags.push('Unofficial communication channel');
  }
  if (lower.includes('100% free') && lower.includes('tractor')) {
    flags.push('Known viral impersonation campaign');
  }
  if (lower.includes('.apk') || lower.includes('download app')) {
    flags.push('Untrusted APK file download warning');
  }

  return flags;
};
