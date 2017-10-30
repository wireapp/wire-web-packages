import {RTCIceServer} from '../user';

interface RTCConfiguration {
  ttl: number;
  ice_servers: RTCIceServer[];
}

export default RTCConfiguration;
