/**
 * Date utility functions for consistent handling across server and client
 * Addresses hydration issues by providing SSR-safe date operations
 */

/**
 * Get current timestamp in a hydration-safe way
 * Returns undefined on server, actual timestamp on client
 */
export function getClientTimestamp(): number | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return Date.now();
}

/**
 * Format date consistently across server and client
 * Uses UTC to avoid timezone differences
 */
export function formatDateConsistent(date: Date | string, locale = 'ko-KR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Use UTC methods for consistency
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Check if a date is expiring soon (within specified days)
 * Returns false on server to prevent hydration mismatch
 */
export function isExpiringSoon(
  expiryDate: Date | string,
  daysThreshold = 7,
  currentTime?: number
): boolean {
  // Server-side always returns false
  if (typeof window === 'undefined' && !currentTime) {
    return false;
  }
  
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = currentTime ? new Date(currentTime) : new Date();
  const timeDiff = expiry.getTime() - now.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  return daysDiff >= 0 && daysDiff <= daysThreshold;
}

/**
 * Get tournament status based on date with consistent time handling
 */
export function getTournamentStatusByDate(
  startDate: string | Date,
  endDate?: string | Date | null,
  currentTime?: number
): 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' {
  const now = currentTime ? new Date(currentTime) : new Date();
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate 
    ? (typeof endDate === 'string' ? new Date(endDate) : endDate)
    : new Date(start.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours
  
  if (now < start) return 'UPCOMING';
  if (now >= start && now < end) return 'IN_PROGRESS';
  return 'COMPLETED';
}

/**
 * Safe date comparison that works consistently across SSR/CSR
 */
export function compareDates(
  date1: Date | string,
  date2: Date | string,
  comparison: 'before' | 'after' | 'same'
): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  switch (comparison) {
    case 'before':
      return d1.getTime() < d2.getTime();
    case 'after':
      return d1.getTime() > d2.getTime();
    case 'same':
      return d1.getTime() === d2.getTime();
    default:
      return false;
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * Returns empty string on server to prevent hydration issues
 */
export function formatRelativeTime(
  date: Date | string,
  currentTime?: number,
  locale = 'ko'
): string {
  // Return empty on server without currentTime
  if (typeof window === 'undefined' && !currentTime) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = currentTime ? new Date(currentTime) : new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (locale === 'ko') {
    if (diffDays > 0) return `${diffDays}일 후`;
    if (diffDays < 0) return `${Math.abs(diffDays)}일 전`;
    if (diffHours > 0) return `${diffHours}시간 후`;
    if (diffHours < 0) return `${Math.abs(diffHours)}시간 전`;
    if (diffMins > 0) return `${diffMins}분 후`;
    if (diffMins < 0) return `${Math.abs(diffMins)}분 전`;
    return '지금';
  }
  
  // English fallback
  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffHours < 0) return `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffMins < 0) return `${Math.abs(diffMins)} minute${Math.abs(diffMins) > 1 ? 's' : ''} ago`;
  return 'now';
}

/**
 * Create a hydration-safe date hook for React components
 * Usage: const currentTime = useHydrationSafeDate();
 */
export function createHydrationSafeDateHook() {
  if (typeof window === 'undefined') {
    return () => null;
  }
  
  return () => {
    const [date, setDate] = typeof window !== 'undefined' 
      ? window.React?.useState?.(null) 
      : [null, () => {}];
    
    if (typeof window !== 'undefined' && window.React?.useEffect) {
      window.React.useEffect(() => {
        setDate(new Date());
      }, []);
    }
    
    return date;
  };
}