const NEXT_IMAGE_ALLOWED_HOSTS = new Set([
  'static.wixstatic.com',
  'images.unsplash.com',
]);

/**
 * Checks whether an image URL can be safely passed to `next/image` without crashing SSR
 * on unconfigured external hostnames.
 */
export function isNextImageOptimizable(src: string | null | undefined): boolean {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && NEXT_IMAGE_ALLOWED_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}
