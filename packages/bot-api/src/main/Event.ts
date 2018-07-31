import {UserConnectionEvent} from '@wireapp/api-client/dist/commonjs/event/index';
import {PayloadBundleIncoming} from '@wireapp/core/dist/conversation/root';

// TODO: Replace "Event" completely with "PayloadBundleIncoming"
interface Event {
  conversationId: string;
  data: PayloadBundleIncoming | UserConnectionEvent;
  fromId: string;
  type: string;
}

export {Event};
