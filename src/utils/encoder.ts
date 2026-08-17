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
 * Picks a random outcome index based on probability weights if configured, or uniform random
 */
export function pickRandomOutcome(config: CustomButtonConfig): { text: string; index: number; rarity?: string } {
  const outcomes = config.outcomes && config.outcomes.length > 0 ? config.outcomes : ['大成功！'];
  const weights = config.outcomeWeights;

  let selectedIndex = 0;
  if (weights && weights.length === outcomes.length) {
    const totalWeight = weights.reduce((sum, w) => sum + (Math.max(0, w) || 1), 0);
    let randomVal = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
      const weight = Math.max(0, weights[i]) || 1;
      if (randomVal < weight) {
        selectedIndex = i;
        break;
      }
      randomVal -= weight;
    }
  } else {
    selectedIndex = Math.floor(Math.random() * outcomes.length);
  }

  const rarity = config.outcomeRarities && config.outcomeRarities[selectedIndex]
    ? config.outcomeRarities[selectedIndex]
    : undefined;

  return {
    text: outcomes[selectedIndex],
    index: selectedIndex,
    rarity,
  };
}

/**
 * Formats the full message text for posting to X, replacing dynamic variables and adding headers
 */
export function formatPostText(
  config: CustomButtonConfig,
  outcomeText: string,
  userInput?: string,
  clickCount: number = 1,
  rarity?: string
): string {
  let fullMessage = outcomeText;

  // Modern dynamic tag replacements
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  fullMessage = fullMessage
    .replace(/\{input\}/g, userInput || 'ゲスト')
    .replace(/\{name\}/g, userInput || 'ゲスト')
    .replace(/\{count\}/g, String(clickCount))
    .replace(/\{date\}/g, dateStr)
    .replace(/\{time\}/g, timeStr)
    .replace(/\{rare\}/g, rarity || 'NORMAL');

  let prefix = config.prefixText ? config.prefixText.trim() : '';
  let suffix = config.suffixText ? config.suffixText.trim() : '';

  if (prefix) {
    prefix = prefix
      .replace(/\{input\}/g, userInput || 'ゲスト')
      .replace(/\{name\}/g, userInput || 'ゲスト')
      .replace(/\{count\}/g, String(clickCount))
      .replace(/\{date\}/g, dateStr)
      .replace(/\{time\}/g, timeStr) + '\n';
  }

  if (suffix) {
    suffix = '\n' + suffix
      .replace(/\{input\}/g, userInput || 'ゲスト')
      .replace(/\{name\}/g, userInput || 'ゲスト')
      .replace(/\{count\}/g, String(clickCount))
      .replace(/\{date\}/g, dateStr)
      .replace(/\{time\}/g, timeStr);
  }

  const titleHeader =
    config.includeTitleInPost !== false && config.title ? `【${config.title}】\n` : '';

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
 * Constructs the shareable URL for this button using both query parameter and hash
 */
export function buildShareableButtonUrl(config: CustomButtonConfig): string {
  const encoded = encodeButtonConfig(config);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?btn=${encoded}#btn=${encoded}`;
}

/**
 * Parses current window URL query param or hash to see if a button config exists
 */
export function getButtonFromUrlHash(): CustomButtonConfig | null {
  if (typeof window === 'undefined') return null;

  // Try query parameter first (used by X crawler and direct link sharing)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const btnParam = searchParams.get('btn');
    if (btnParam) {
      const config = decodeButtonConfig(btnParam);
      if (config) return config;
    }
  } catch (e) {
    console.error('Error reading URL search params:', e);
  }

  // Try hash fragment fallback
  const hash = window.location.hash;
  if (hash && hash.includes('#btn=')) {
    const encodedStr = hash.replace(/^.*#btn=/, '');
    if (encodedStr) {
      return decodeButtonConfig(encodedStr);
    }
  }

  return null;
}
