import {ClientPreKey} from '../auth';

interface PreKeyBundle {
  clients: ClientPreKey[];
  user: string;
}

export default PreKeyBundle;
