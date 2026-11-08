/**
 * In-memory & browser image cache for rapid, flicker-free photo rendering.
 * Prevents redundant network downloads and eliminates photo loading delays
 * across Dashboard List Token, Swacam, and Neteco Unmon.
 */

const memoryUrlCache = new Map<string, string>();
const preloadedImageUrls = new Set<string>();

/**
 * Stores or updates a photo's best URL in memory cache
 */
export function cachePhotoUrl(photoId: string, url: string): void {
  if (!photoId || !url) return;
  memoryUrlCache.set(photoId, url);

  // Pre-load image in browser background cache if it's an HTTP/HTTPS URL
  if (url.startsWith('http') && !preloadedImageUrls.has(url)) {
    preloadedImageUrls.add(url);
    const img = new Image();
    img.src = url;
  }
}

/**
 * Retrieves the best instantly-available URL for a photo record.
 * Prioritizes memory cache, then dataUrl, then storageUrl.
 */
export function getOptimizedPhotoUrl(photo: { id?: string; dataUrl?: string; storageUrl?: string; url?: string; photoUrl?: string }): string {
  if (!photo) return '';
  if (photo.id && memoryUrlCache.has(photo.id)) {
    const cached = memoryUrlCache.get(photo.id);
    if (cached) return cached;
  }
  const resolved = photo.dataUrl || photo.storageUrl || photo.url || photo.photoUrl || '';
  if (photo.id && resolved) {
    cachePhotoUrl(photo.id, resolved);
  }
  return resolved;
}

/**
 * Clears a specific photo from cache (e.g. when deleted)
 */
export function invalidatePhotoCache(photoId: string): void {
  memoryUrlCache.delete(photoId);
}
