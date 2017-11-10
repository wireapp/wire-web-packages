interface ConversationEvent {
  conversation: string;
  from: string;
  time: string;
  type:
    | 'conversation.connect-request'
    | 'conversation.create'
    | 'conversation.delete'
    | 'conversation.member-join'
    | 'conversation.member-leave'
    | 'conversation.member-update'
    | 'conversation.otr-message-add'
    | 'conversation.rename'
    | 'conversation.typing';
}

export default ConversationEvent;
