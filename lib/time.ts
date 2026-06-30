/**
 * ISO Week utilities for weekly challenges and leaderboards
 */

/**
 * Get ISO week key in format "YYYY-Www" (e.g., "2024-W01")
 * ISO weeks start on Monday, week 1 is the first week with a Thursday
 */
export function isoWeekKey(d: Date = new Date()): string {
  const date = new Date(d.getTime());
  const dayOfWeek = date.getDay() || 7; // Convert Sunday (0) to 7
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek + 1); // Get Monday of current week
  
  // Get Thursday of the week (for ISO week calculation)
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  
  const year = thursday.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const daysSinceStart = Math.floor((thursday.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const firstThursdayDay = (4 - startOfYear.getDay() + 7) % 7 || 7;
  const weekNumber = Math.floor((daysSinceStart - firstThursdayDay + 7) / 7) + 1;
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Check if two ISO week keys represent the same week
 */
export function isSameISOWeek(a: string, b: string): boolean {
  return a === b;
}

/**
 * Get ISO month key in format "YYYY-MM" (e.g., "2025-12")
 * Uses UTC for stable month grouping (DST-safe)
 */
export function isoMonthKey(d: Date | string | number = new Date()): string {
  const dt = new Date(d);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Check if two dates are in the same ISO month
 */
export function isSameISOMonth(a: Date | string | number, b: Date | string | number): boolean {
  return isoMonthKey(a) === isoMonthKey(b);
}

