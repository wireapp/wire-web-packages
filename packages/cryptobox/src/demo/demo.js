const cryptobox = require('../../');
const {StoreEngine} = require('@wireapp/store-engine');
const Logdown = require('logdown');

const logger = new Logdown('Demo', {alignOutput: true});
logger.log(`Testing Cryptobox v${cryptobox.Cryptobox.prototype.VERSION}`);

(async () => {
  try {
    const MIN_AMOUNT_PREKEYS = 5;
    const engine = new StoreEngine.MemoryEngine();
    await engine.init('cache');

    const box = new cryptobox.Cryptobox(engine, MIN_AMOUNT_PREKEYS);
    await box.create();

    const fingerprint = box.identity.public_key.fingerprint();
    console.log(`Public Fingerprint: ${fingerprint}`);
    process.exit(0);
  } catch (error) {
    console.log(`Self test broken: ${error.message} (${error.stack})`);
    process.exit(1);
  }
})();
