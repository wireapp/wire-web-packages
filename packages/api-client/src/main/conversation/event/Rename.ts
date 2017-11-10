import ConversationEvent from './ConversationEvent';

interface Rename extends ConversationEvent {
  data: {
    name: string;
  };
  type: 'conversation.rename';
}

export default Rename;
