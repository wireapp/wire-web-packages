# @wireapp/open-graph

Open Graph metadata parser. Fork of [node-open-graph](https://github.com/wireapp/node-open-graph).

## Usage

```typescript
import {getOpenGraphData, openGraph} from '@wireapp/open-graph';

const metadata = await getOpenGraphData('https://example.com');
const parsed = openGraph('<meta property="og:title" content="Example">');
```

Only https URLs are fetched. Hosts resolving to private or reserved addresses are rejected, redirects are revalidated, and responses are limited to `text/html`, 1 MB and 10 seconds.
