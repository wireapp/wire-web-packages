import {UserClients} from '../conversation/';

interface ClientMismatch {
  deleted: UserClients;
  missing: UserClients;
  redundant: UserClients;
  time: string;
}

export default ClientMismatch;
