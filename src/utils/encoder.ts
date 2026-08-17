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
 * Formats the full message text for posting to X, including optional button title header 【ボタン名】
 */
export function formatPostText(
  config: CustomButtonConfig,
  outcomeText: string,
  userInput?: string
): string {
  let fullMessage = outcomeText;
  if (config.mode === 'input' && userInput) {
    fullMessage = fullMessage.replace(/\{input\}/g, userInput).replace(/\{name\}/g, userInput);
  }

  const titleHeader =
    config.includeTitleInPost !== false && config.title ? `【${config.title}】\n` : '';
  const prefix = config.prefixText ? config.prefixText.trim() + '\n' : '';
  const suffix = config.suffixText ? '\n' + config.suffixText.trim() : '';

  return `${titleHeader}${prefix}${fullMessage}${suffix}`;
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
  shareableUrl?: string;
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

  const finalUrl = options.targetUrl?.trim() || options.shareableUrl?.trim();
  if (finalUrl) {
    params.set('url', finalUrl);
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
