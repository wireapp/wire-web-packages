import {Member, OtherMember} from '../conversation';

interface ConversationMembers {
  others: OtherMember[];
  self: Member;
}

export default ConversationMembers;
