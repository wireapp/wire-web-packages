import {TeamInvitation} from '../invitation';

interface TeamInvitationChunk {
  has_more: boolean;
  invitations: TeamInvitation[];
}

export default TeamInvitationChunk;
