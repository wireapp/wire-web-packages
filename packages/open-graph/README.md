# @wireapp/open-graph

Open Graph metadata parser and utilities for Wire web applications.

This package provides TypeScript-first utilities for parsing and working with Open Graph metadata, built on top of the `open-graph` (node-open-graph) library.

## Installation

```bash
yarn add @wireapp/open-graph
```

## Usage

### Using Promises (Recommended)

```typescript
import {getOpenGraphData, getOpenGraphDataSafe} from '@wireapp/open-graph';

// Fetch Open Graph data (throws on error)
try {
  const url = 'https://example.com';
  const metadata = await getOpenGraphData(url);
  console.log(metadata.title);
  console.log(metadata.image);
} catch (error) {
  console.error('Failed to fetch Open Graph data:', error);
}

// Fetch Open Graph data (returns null on error)
const url = 'https://example.com';
const metadata = await getOpenGraphDataSafe(url);
if (metadata) {
  console.log(metadata.title);
}
```

### Using Callbacks (Original API)

```typescript
import {getOpenGraphDataAsync} from '@wireapp/open-graph';

const url = 'https://example.com';
getOpenGraphDataAsync(url, (error, metadata) => {
  if (error) {
    console.error('Failed to fetch Open Graph data:', error);
    return;
  }
  console.log(metadata?.title);
});
```

### Parsing HTML you already have

```typescript
import {openGraph} from '@wireapp/open-graph';

const meta = openGraph('<html><head><meta property="og:title" content="Example"></head></html>');
console.log(meta.title); // "Example"
```

## Fetching and security

`getHTML` and everything built on it only fetch **https** URLs. A URL without a scheme is treated as https; `http:` and every other scheme are rejected. Before a connection is opened, the hostname is resolved and every returned address is checked against loopback, private, link-local, multicast and other non-routable ranges, including IPv4 addresses embedded in IPv6 forms. The connection is then pinned to the address that was checked, so a DNS rebinding between check and connect cannot redirect the request to an internal host. Redirects are followed at most three times and every hop goes through the same validation.

Responses must be `text/html`, are capped at 1 MB, and time out after 10 seconds. These limits can be adjusted through the options of `fetchOpenGraphData`:

```typescript
import {fetchOpenGraphData} from '@wireapp/open-graph';

const meta = await fetchOpenGraphData('https://example.com', {
  maxRedirects: 1,
  maxBodyLength: 500_000,
  timeoutMs: 5_000,
});
```

The guard is exported for callers that fetch related resources themselves, for example preview images:

```typescript
import {resolveSafeUrl, isPrivateAddress} from '@wireapp/open-graph';

const {url, address} = await resolveSafeUrl(imageUrl); // throws for http, credentials, private targets
```

## Types

The package exports the following TypeScript interfaces:

### `OpenGraphMetadata`

Represents Open Graph metadata properties:

```typescript
interface OpenGraphMetadata {
  title?: string;
  type?: string;
  url?: string;
  description?: string;
  image?: OpenGraphImage | OpenGraphImage[];
  site_name?: string;
  locale?: string;
  [key: string]: unknown;
}
```

### `OpenGraphImage`

Represents an Open Graph image property:

```typescript
interface OpenGraphImage {
  url?: string;
  width?: string | number;
  height?: string | number;
  type?: string;
  alt?: string;
}
```

## Features

- ✅ Full TypeScript support with type definitions
- ✅ Promise-based API for async/await usage
- ✅ Safe wrapper that returns null on errors
- ✅ Original callback-based API support for flexibility
- ✅ Properly typed Open Graph metadata interfaces
- ✅ Integrated with Wire's web application ecosystem

## Dependencies

- **cheerio** - HTML parsing
- **dompurify** with **jsdom** - content sanitization
