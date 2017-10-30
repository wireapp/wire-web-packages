import {ServiceRef} from '../conversation';
import {UserAsset} from '../user';

interface User {
  accent_id?: number;
  assets: UserAsset[];
  deleted?: boolean;
  handle?: string;
  id: string;
  name: string;
  service?: ServiceRef;
}

export default User;
