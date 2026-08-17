import { CustomButtonConfig } from '../types';

/**
 * Encodes a button configuration object into a URL-safe Base64 string for hash sharing
 */
export function encodeButtonConfig(config: CustomButtonConfig): string {
  try {
    const jsonString = JSON.stringify(config);
    // Use encodeURIComponent + btoa for UTF-8 compatibility
    const utf8Bytes = encodeURIComponent(jsonString).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(utf8Bytes);
  } catch (err) {
    console.error('Failed to encode config:', err);
    return '';
  }
}

/**
 * Decodes a URL-safe Base64 string back into a CustomButtonConfig object
 */
export function decodeButtonConfig(encodedStr: string): CustomButtonConfig | null {
  try {
    const decodedBytes = atob(encodedStr);
    const jsonString = decodeURIComponent(
      Array.prototype.map
        .call(decodedBytes, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Failed to decode config:', err);
    return null;
  }
}

/**
 * Clean up hashtags array: remove `#` prefixes, trim, and filter out empty strings
 */
export function normalizeHashtags(tags: string[] | string): string[] {
  if (typeof tags === 'string') {
    tags = tags.split(/[\s,]+/);
  }
  return tags
    .map((t) => t.trim().replace(/^#+/, ''))
    .filter((t) => t.length > 0);
}

/**
 * Generates the official X (Twitter) Intent URL
 * https://x.com/intent/post?text=...&hashtags=...&url=...
 */
export function buildXIntentUrl(options: {
  text: string;
  hashtags?: string[];
  targetUrl?: string;
}): string {
  const params = new URLSearchParams();

  if (options.text) {
    params.set('text', options.text);
  }

  if (options.hashtags && options.hashtags.length > 0) {
    const cleanedTags = normalizeHashtags(options.hashtags);
    if (cleanedTags.length > 0) {
      params.set('hashtags', cleanedTags.join(','));
    }
  }

  if (options.targetUrl && options.targetUrl.trim().length > 0) {
    params.set('url', options.targetUrl.trim());
  }

  return `https://x.com/intent/post?${params.toString()}`;
}

/**
 * Constructs the shareable URL for this button
 */
export function buildShareableButtonUrl(config: CustomButtonConfig): string {
  const encoded = encodeButtonConfig(config);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#btn=${encoded}`;
}

/**
 * Parses current window URL hash to see if a button config exists
 */
export function getButtonFromUrlHash(): CustomButtonConfig | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('#btn=')) return null;

  const encodedStr = hash.replace(/^.*#btn=/, '');
  if (!encodedStr) return null;

  return decodeButtonConfig(encodedStr);
}
