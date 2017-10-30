import {OTRRecipients} from '../conversation';

interface NewOTRMessage {
  data?: any; // Defaults to Protocol Buffer. Use type 'string' for JSON.
  native_priority?: 'low' | 'high';
  native_push?: boolean;
  recipients: OTRRecipients;
  sender: string;
  transient?: boolean;
}

export default NewOTRMessage;
