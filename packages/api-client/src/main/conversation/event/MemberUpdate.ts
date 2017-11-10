import ConversationEvent from './ConversationEvent';

// https://github.com/wearezeta/backend-api-docs/wiki/API-User-Notifications#conversationmember-update-cached
interface MemberUpdate extends ConversationEvent {
  data: {
    otr_archived?: boolean; // Whether the conversation has been archived.
    otr_archived_ref?: string; // A reference point associated with the last (un)archiving.
    otr_muted?: boolean; // Whether the conversation has been muted.
    otr_muted_ref?: string; // A reference point associated with the last (un)muting.
  };
  type: 'conversation.member-update';
}

export default MemberUpdate;
