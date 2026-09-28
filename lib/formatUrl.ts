/**
 * Normalizes external URLs to ensure they include a valid protocol (https://).
 * Prevents Next.js and browsers from treating links like 'youtube.com' or 'www.youtube.com'
 * as internal relative routes on the current site, which results in a 404 Not Found error.
 */
export function formatExternalUrl(url?: string | null, fallback: string = '#'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Already an absolute URL with protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Protocol-relative URL (e.g. //youtube.com/...)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // mailto: or tel:
  if (/^(mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  // If user entered @handle directly for a social URL (e.g. @GamersGuild-NGP)
  if (trimmed.startsWith('@')) {
    return `https://youtube.com/${trimmed}`;
  }

  // Prepend https://
  return `https://${trimmed}`;
}
