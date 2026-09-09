/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import * as cheerio from 'cheerio';
import createDOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';

/**
 * Represents Open Graph metadata properties
 */
export interface OpenGraphMetadata {
  title?: string;
  type?: string;
  url?: string;
  description?: string;
  image?: OpenGraphImage | OpenGraphImage[];
  site_name?: string;
  locale?: string;
  [key: string]: unknown;
}

/**
 * Represents an Open Graph image property
 */
export interface OpenGraphImage {
  url?: string;
  width?: string | number;
  height?: string | number;
  type?: string;
  alt?: string;
}

interface ParserOptions {
  userAgent?: string;
  sanitization?: Record<string, unknown>;
  maxContentLength?: number;
  maxPropertyLength?: number;
  strict?: boolean;
}

// Shorthand properties mapping
const shorthandProperties: Record<string, string> = {
  image: 'image:url',
  video: 'video:url',
  audio: 'audio:url',
};

// Keys that should never be used (security)
const keyBlacklist = ['__proto__', 'constructor', 'prototype'];

/**
 * Sanitize content using DOMPurify + additional safety checks
 */
function sanitizeContent(content: unknown, options?: ParserOptions): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Create DOMPurify instance for secure sanitization
  const window = new JSDOM('').window as any;
  const DOMPurify = createDOMPurify(window);

  // DOMPurify configuration for OpenGraph content (strip all HTML, keep text)
  let purifyConfig: any = {
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: [], // Remove all attributes
    KEEP_CONTENT: true, // Keep text content
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
  };

  // Allow custom DOMPurify config from options
  if (options?.sanitization) {
    purifyConfig = Object.assign(purifyConfig, options.sanitization);
  }

  // First pass: DOMPurify for HTML sanitization
  const sanitizeResult = DOMPurify.sanitize(content, purifyConfig);
  let sanitized = typeof sanitizeResult === 'string' ? sanitizeResult : sanitizeResult.toString();

  if (!sanitized) {
    return '';
  }

  // Second pass: Additional filtering for non-HTML dangerous patterns
  const dangerousPatterns = [
    /javascript:/gi,
    /vbscript:/gi,
    /livescript:/gi,
    /file:/gi,
    /data:/gi,
    /\brequire\s*\(/gi,
    /\bprocess\b/gi,
    /\bglobal\./gi,
    /\bmodule\./gi,
    /\bexports\./gi,
    /\bchild_process\b/gi,
    /\beval\s*\(/gi,
    /\bFunction\s*\(/gi,
    /\bsetTimeout\s*\(/gi,
    /\bsetInterval\s*\(/gi,
  ];

  // Remove dangerous patterns
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Limit content length
  const maxLength = options?.maxContentLength || 10000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Sanitize property keys
 */
function sanitizePropertyKey(key: unknown, options?: ParserOptions): string {
  if (!key || typeof key !== 'string') {
    return '';
  }

  // Limit key length
  const maxLength = options?.maxPropertyLength || 200;
  if (key.length > maxLength) {
    return '';
  }

  // Convert to lowercase for consistency
  let sanitized = key.toLowerCase().trim();

  // Allow only safe characters for OpenGraph properties
  const allowedChars = /^[a-zA-Z0-9_\-:.]+$/;
  if (!allowedChars.test(sanitized)) {
    // Clean up the key
    sanitized = sanitized.replace(/[^a-zA-Z0-9_\-:.]/g, '');
  }

  return sanitized;
}

/**
 * Parse HTML and extract Open Graph metadata
 */
export function parseHTML(html: string, options?: ParserOptions): OpenGraphMetadata {
  const $ = cheerio.load(html);

  // Check for xml namespace
  let namespace: string | undefined;
  const $html = $('html');

  if ($html.length) {
    const element = $html[0] as any;
    const attribKeys = Object.keys(element.attribs || {});

    attribKeys.some(attrName => {
      const attrValue = $html.attr(attrName);
      if (
        attrValue?.toLowerCase() === 'http://opengraphprotocol.org/schema/' &&
        attrName.substring(0, 6) === 'xmlns:'
      ) {
        namespace = attrName.substring(6);
        return false;
      }
      return false;
    });
  }

  if (options?.strict) {
    return {} as OpenGraphMetadata;
  }

  if (!namespace) {
    // If no namespace is explicitly set...
    if (options?.strict) {
      // and strict mode is specified, abort parse.
      return {} as OpenGraphMetadata;
    }
    // and strict mode is not specific, then default to "og"
    namespace = 'og';
  }

  const meta: any = Object.create(null);
  const metaTags = $('meta');

  metaTags.each(function (this: any) {
    const $elem = $(this);
    const propertyAttr = $elem.attr('property');

    // If meta element isn't an "og:" property, skip it
    if (!propertyAttr || propertyAttr.substring(0, namespace!.length) !== namespace) {
      return;
    }

    const property = propertyAttr.substring(namespace!.length + 1);
    let content = $elem.attr('content');

    // Sanitize content for security
    content = sanitizeContent(content, options);
    if (!content) {
      return; // Skip empty content after sanitization
    }

    // Sanitize the property name first
    let sanitizedProperty = sanitizePropertyKey(property, options);
    if (!sanitizedProperty) {
      return; // Skip if property becomes invalid after sanitization
    }

    // If property is a shorthand for a longer property, use the full property
    sanitizedProperty = shorthandProperties[sanitizedProperty] || sanitizedProperty;

    // Ensure property is still a valid string after shorthand lookup
    if (!sanitizedProperty || typeof sanitizedProperty !== 'string') {
      return;
    }

    let key: string;
    let tmp: any;
    let ptr: any = meta;
    const keys = sanitizedProperty.split(':', 4);

    // Sanitize each key component for security
    for (let i = 0; i < keys.length; i++) {
      keys[i] = sanitizePropertyKey(keys[i], options);
      if (!keys[i] && i < keys.length - 1) {
        return; // Skip if intermediate key becomes invalid
      }
    }

    // we want to leave one key to assign to so we always use references
    // as long as there's one key left, we're dealing with a sub-node and not a value
    while (keys.length > 1) {
      key = keys.shift()!;

      if (keyBlacklist.includes(key.toLowerCase())) {
        return;
      }

      if (Array.isArray(ptr[key])) {
        // the last index of ptr[key] should become the object we are examining.
        tmp = ptr[key].length - 1;
        ptr = ptr[key];
        key = tmp;
      }

      if (typeof ptr[key] === 'string') {
        // if it's a string, convert it
        ptr[key] = {'': ptr[key]};
      } else if (ptr[key] === undefined) {
        // create a new key
        ptr[key] = Object.create(null);
      }

      // move our pointer to the next subnode
      ptr = ptr[key];
    }

    // deal with the last key
    key = keys.shift()!;
    if (keyBlacklist.includes(key.toLowerCase())) {
      return;
    }

    if (ptr[key] === undefined) {
      ptr[key] = content;
    } else if (Array.isArray(ptr[key])) {
      ptr[key].push(content);
    } else {
      ptr[key] = [ptr[key], content];
    }
  });

  // If no 'og:title', use title tag
  if (!('title' in meta)) {
    const titleText = $('title').text();
    meta.title = sanitizeContent(titleText, options);
  }

  // Fallback for image meta - use first image on page
  if (!('image' in meta)) {
    const img = $('img');

    if (img.length) {
      const imgObj: any = {};
      const imgSrc = $('img').attr('src');
      imgObj.url = sanitizeContent(imgSrc, options);

      // Only include image if URL is valid after sanitization
      if (imgObj.url) {
        // Set image width and height properties if respective attributes exist
        const imgWidth = $('img').attr('width');
        const imgHeight = $('img').attr('height');

        if (imgWidth) {
          const sanitizedWidth = sanitizeContent(imgWidth, options);
          if (sanitizedWidth && /^\d+$/.test(sanitizedWidth)) {
            imgObj.width = sanitizedWidth;
          }
        }
        if (imgHeight) {
          const sanitizedHeight = sanitizeContent(imgHeight, options);
          if (sanitizedHeight && /^\d+$/.test(sanitizedHeight)) {
            imgObj.height = sanitizedHeight;
          }
        }

        meta.image = imgObj;
      }
    }
  }

  return meta as OpenGraphMetadata;
}

/**
 * Fetch HTML from URL
 */
export async function getHTML(url: string, userAgent: string): Promise<string> {
  // Handle protocol-less URLs
  const purl = new URL(url, 'https://');
  const fullUrl = purl.href;

  const response = await fetch(fullUrl, {
    headers: {
      'User-Agent': userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with HTTP status code: ${response.status}`);
  }

  return response.text();
}

/**
 * Fetch and parse Open Graph metadata from a URL
 */
export async function fetchOpenGraphData(url: string, options?: ParserOptions): Promise<OpenGraphMetadata> {
  const userAgent = options?.userAgent || 'OpenGraphParser (https://github.com/wireapp/wire-web-packages)';

  try {
    const html = await getHTML(url, userAgent);
    return parseHTML(html, options);
  } catch (error) {
    throw error;
  }
}
