import {PreKey} from '../auth';

interface NewClient {
  class: 'desktop' | 'phone' | 'tablet';
  cookie: string;
  label?: string;
  lastkey: PreKey;
  model?: string;
  password?: string;
  prekeys: PreKey[]; // Serialized PreKey
  sigkeys: {
    enckey: string;
    mackey: string;
  };
  type: 'permanent' | 'temporary';
}

export default NewClient;
