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

import {fetchOpenGraphData, parseHTML, getHTML} from './openGraphParser';

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

/**
 * Fetch and parse Open Graph metadata from a URL
 * @param url The URL to fetch metadata from
 * @returns Promise containing the Open Graph metadata
 * @throws Error if the URL is invalid or the request fails
 */
export async function getOpenGraphData(url: string): Promise<OpenGraphMetadata> {
  return fetchOpenGraphData(url);
}

/**
 * Safely fetch Open Graph metadata from a URL
 * @param url The URL to fetch metadata from
 * @returns Promise containing the Open Graph metadata or null if fetching fails
 */
export async function getOpenGraphDataSafe(url: string): Promise<OpenGraphMetadata | null> {
  try {
    return await getOpenGraphData(url);
  } catch {
    return null;
  }
}

/**
 * Callback-based fetch for Open Graph metadata
 * @param url The URL to fetch metadata from
 * @param callback Function to call with the results
 */
export function getOpenGraphDataAsync(
  url: string,
  callback: (err: Error | null, data?: OpenGraphMetadata) => void,
): void {
  getOpenGraphData(url)
    .then(data => callback(null, data))
    .catch(err => callback(err));
}

/**
 * Parse HTML string and extract Open Graph metadata
 * @param html The HTML content to parse
 * @returns Parsed Open Graph metadata
 */
export function openGraph(html: string): OpenGraphMetadata {
  return parseHTML(html);
}

// Re-export the parser functions for advanced usage
export {fetchOpenGraphData, parseHTML, getHTML};
