import {ConversationEvent} from './event/';

interface IncomingNotification {
  payload: ConversationEvent[];
  id: string;
  transient: boolean;
}

export default IncomingNotification;
