## Example

```typescript
import {Bot, BotConfig, BotCredentials} from '@wireapp/bot-api';
import {DebugHandler} from '@wireapp/bot-handler-debug';

const credentials: BotCredentials = {
  email: process.env.WIRE_EMAIL!,
  password: process.env.WIRE_PASSWORD!,
};

const config: BotConfig = {
  backend: 'production',
};

const bot = new Bot(credentials, config);
bot.addHandler(new DebugHandler());

await this.bot.start();
```
