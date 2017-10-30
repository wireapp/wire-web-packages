import ConversationEvent from './ConversationEvent';

interface MemberJoin extends ConversationEvent {
  data: {
    user_ids: string[];
  };
  type: 'conversation.member-join';
}

export default MemberJoin;
