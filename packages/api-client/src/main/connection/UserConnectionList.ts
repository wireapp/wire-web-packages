import {Connection} from '../connection';

interface UserConnectionList {
  connections: Connection[];
  has_more: boolean;
}

export default UserConnectionList;
