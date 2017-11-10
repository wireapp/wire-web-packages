import {Invitation} from '../invitation';

interface InvitationList {
  has_more: boolean;
  invitations: Invitation[];
}

export default InvitationList;
