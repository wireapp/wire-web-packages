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

### Direct Access to openGraph Function

```typescript
import {openGraph} from '@wireapp/open-graph';

openGraph('https://example.com', (err, meta) => {
  console.log(meta);
});
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

- **[open-graph](https://github.com/wireapp/node-open-graph)** - The core Open Graph parser
