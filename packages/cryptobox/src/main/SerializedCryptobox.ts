export type SerializedCryptobox = {
  identity: string;
  prekeys: string[];
  sessions: {[sessionId: string]: string};
};
