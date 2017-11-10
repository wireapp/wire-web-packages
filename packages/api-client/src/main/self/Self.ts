import {UserAsset} from '../user';

interface Self {
  accent_id?: number;
  assets: UserAsset[];
  deleted?: boolean;
  email?: string;
  handle?: string;
  id: string;
  locale: string;
  name: string;
  phone?: string;
  team?: string;
}

export default Self;
