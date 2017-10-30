import {PreKey} from '../auth';

interface UserPreKeyBundleMap {
  [userId: string]: {
    [clientId: string]: PreKey;
  };
}

export default UserPreKeyBundleMap;
