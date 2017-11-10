import {OTRClientMap} from '../conversation';

interface OTRRecipients {
  [userId: string]: OTRClientMap;
}

export default OTRRecipients;
