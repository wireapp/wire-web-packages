import {ConversationMembers} from '../conversation';

interface Conversation {
  access?: string[]; // not used
  creator: string;
  id: string;
  last_event_time: string; // not used
  last_event: string; // not used
  members: ConversationMembers;
  name?: string;
  team: string;
  type: 0 | 1 | 2 | 3;
}

export default Conversation;
