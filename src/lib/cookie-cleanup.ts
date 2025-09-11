/**
 * Cookie cleanup utility - DISABLED
 * JWT tokens starting with 'eyJ' are VALID tokens, not malformed!
 * This file is kept for reference but functionality is disabled.
 */

export function cleanupSupabaseCookies() {
  // DISABLED - This was incorrectly removing valid JWT tokens
  // JWT tokens start with 'eyJ' which is base64 encoded '{"'
  // This is NORMAL and EXPECTED behavior
  return;
}

// Do not auto-run
// This was causing authentication issues