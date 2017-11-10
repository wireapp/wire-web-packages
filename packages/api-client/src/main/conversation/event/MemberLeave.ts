import ConversationEvent from './ConversationEvent';

interface MemberLeave extends ConversationEvent {
  data: {
    user_ids: string[];
  };
  type: 'conversation.member-leave';
}

export default MemberLeave;
