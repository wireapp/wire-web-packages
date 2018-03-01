const cryptobox = typeof window === 'object' ? window.cryptobox : require('@wireapp/cryptobox');
const Proteus = typeof window === 'object' ? window.Proteus : require('@wireapp/proteus');
const {StoreEngine} = require('@wireapp/store-engine');

describe('cryptobox.store.Cache', () => {
  let store = undefined;

  beforeEach(async () => {
    const engine = new StoreEngine.MemoryEngine();
    await engine.init('cache');
    store = new cryptobox.store.CryptoboxCRUDStore(engine);
  });

  describe('"constructor"', () => {
    it('creates an instance', () => {
      const storeInstance = new cryptobox.store.Cache();
      expect(storeInstance).toBeDefined();
    });

    it('causes new identities on a Cryptobox initialization with a new storage instance (because a cache is temporary)', done => {
      let box = new cryptobox.Cryptobox(new cryptobox.store.Cache(), 1);

      let firstFingerprint = undefined;
      let secondFingerprint = undefined;

      box
        .create()
        .then(() => {
          firstFingerprint = box.identity.public_key.fingerprint();
          box = new cryptobox.Cryptobox(new cryptobox.store.Cache(), 1);
          return box.create();
        })
        .then(() => {
          secondFingerprint = box.identity.public_key.fingerprint();
          expect(firstFingerprint).not.toBe(secondFingerprint);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('"save_identity"', () => {
    it('saves the local identity', async done => {
      const ikp = await Proteus.keys.IdentityKeyPair.new();
      store
        .save_identity(ikp)
        .then(identity => {
          expect(identity.public_key.fingerprint()).toEqual(ikp.public_key.fingerprint());
          done();
        })
        .catch(done.fail);
    });
  });
});
