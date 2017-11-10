import {UserAsset} from '../user';

interface UserUpdate {
  accent_id?: number;
  assets?: UserAsset[];
  name: string;
}

export default UserUpdate;
