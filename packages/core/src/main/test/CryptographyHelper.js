const bazinga64 = require('bazinga64');
const Proteus = require('@wireapp/proteus');
const StoreHelper = require('./StoreHelper');
const {Cryptobox} = require('@wireapp/cryptobox');

module.exports = {
  createEncodedCipherText: async (receivingIdentity, preKey, text) => {
    const senderEngine = await StoreHelper.createMemoryEngine();
    const sender = new Cryptobox(senderEngine, 1);
    await sender.create();

    const sessionId = `from-${sender.identity.public_key.fingerprint()}-to-${preKey.key_pair.public_key.fingerprint()}`;
    const preKeyBundle = Proteus.keys.PreKeyBundle.new(receivingIdentity.public_key, preKey);

    const encryptedPreKeyMessage = await sender.encrypt(sessionId, text, preKeyBundle.serialise());

    const cipherText = await sender.encrypt(sessionId, encryptedPreKeyMessage, preKeyBundle.serialise());
    return bazinga64.Encoder.toBase64(cipherText).asString;
  },
};
