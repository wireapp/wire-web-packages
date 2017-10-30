import {ServiceRef} from '../conversation';

interface Member {
  hidden_ref?: string;
  hidden?: boolean;
  id: string;
  otr_archived_ref?: string;
  otr_archived?: boolean;
  otr_muted_ref?: string;
  otr_muted?: boolean;
  service?: ServiceRef;
}

export default Member;
