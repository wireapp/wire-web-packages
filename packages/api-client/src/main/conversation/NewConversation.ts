import {TeamInfo} from '../team';

interface NewConversation {
  name?: string;
  team?: TeamInfo;
  users: string[];
}

export default NewConversation;
