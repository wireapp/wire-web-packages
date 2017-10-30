import ConversationEvent from './ConversationEvent';

interface OTRMessageAdd extends ConversationEvent {
  data: {
    text: string;
    sender: string;
    recipient: string;
  };
  type: 'conversation.otr-message-add';
}

export default OTRMessageAdd;
