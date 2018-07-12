import {Account} from '@wireapp/core';
import {PayloadBundleIncoming} from '@wireapp/core/dist/conversation/root';

interface MessageHandler {
  handleText: (account: Account, payload: PayloadBundleIncoming) => void;
}

export {MessageHandler};
