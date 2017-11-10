import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';

interface Config {
  store?: CRUDEngine;
  urls?: {
    name?: string;
    rest: string;
    ws?: string;
  };
}

export default Config;
