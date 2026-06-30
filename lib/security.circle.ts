/**
 * Security stub for circle ID validation
 * MVP: Basic format validation (will be replaced by backend verification)
 */

/**
 * Verify client-side circle ID format
 * Accepts alphanumeric + dash, 3-40 chars
 */
export function verifyClientCircleId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // Alphanumeric + dash, 3-40 characters
  return /^[a-z0-9-]{3,40}$/i.test(id);
}

/**
 * Generate a safe circle ID from a name
 * Slugifies name and adds short random suffix
 */
export function slugifyCircleName(name: string): string {
  // Convert to lowercase, replace spaces with dashes, remove special chars
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30); // Limit length
  
  // Add short random suffix (4 chars)
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug}-${suffix}`;
}

