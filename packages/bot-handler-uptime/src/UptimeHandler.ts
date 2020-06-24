import moment from 'moment';
import 'moment-duration-format';
import {PayloadBundle, PayloadBundleSource, PayloadBundleType} from '@wireapp/core/dist/conversation/';
import {QuotableMessage} from '@wireapp/core/dist/conversation/message/OtrMessage';
import {MessageHandler} from '@wireapp/bot-api';
import {TextContent} from '@wireapp/core/dist/conversation/content';

export class UptimeHandler extends MessageHandler {
  async handleEvent(payload: PayloadBundle): Promise<void> {
    if (payload.source === PayloadBundleSource.NOTIFICATION_STREAM) {
      return;
    }
    switch (payload.type) {
      case PayloadBundleType.TEXT: {
        const content = payload.content as TextContent;
        if (content.text === '/uptime') {
          const seconds: number = Math.floor(process.uptime());
          const formatted: string = (moment.duration(seconds, 'seconds') as any).format({
            precision: 0,
            template: 'y [years], w [weeks], d [days], h [hours], m [minutes], s [seconds]',
          });

          await this.sendReply(payload.conversation, payload as QuotableMessage, `Running since: ${formatted}`);
        }
        break;
      }
    }
  }
}
