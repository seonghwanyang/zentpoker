'use client';

import { useEffect } from 'react';
import { cleanupSupabaseCookies } from '@/lib/cookie-cleanup';

export function CookieCleanup() {
  useEffect(() => {
    // Run cleanup immediately on mount
    cleanupSupabaseCookies();
    
    // Run cleanup more aggressively initially
    const immediateTimeout = setTimeout(() => {
      cleanupSupabaseCookies();
    }, 100);
    
    const shortTimeout = setTimeout(() => {
      cleanupSupabaseCookies();
    }, 500);
    
    // Then run periodically
    const interval = setInterval(() => {
      cleanupSupabaseCookies();
    }, 2000); // Check every 2 seconds
    
    return () => {
      clearTimeout(immediateTimeout);
      clearTimeout(shortTimeout);
      clearInterval(interval);
    };
  }, []);
  
  return null;
}