#!/usr/bin/env node

const Proteus = require('@wireapp/proteus');
const {Cryptobox} = require('@wireapp/cryptobox');
const {MemoryEngine} = require('@wireapp/store-engine');

const sessionWithAlice = 'session-with-alice';
const sessionWithBob = 'session-with-bob';
const messageCount = 3000;

const measure = timer => {
  const [seconds, nanoseconds] = process.hrtime(timer);
  const NANOSECONDS_IN_SECOND = 1e9;
  const digits = 3;
  return (seconds + nanoseconds / NANOSECONDS_IN_SECOND).toFixed(digits);
};

async function createCryptobox(storeName, amountOfPreKeys = 1) {
  const engine = new MemoryEngine();
  await engine.init(storeName);
  return new Cryptobox(engine, amountOfPreKeys);
}

async function setup() {
  const alice = await createCryptobox('alice', 1);
  await alice.create();

  const bob = await createCryptobox('bob', 1);
  await bob.create();

  const bobBundle = Proteus.keys.PreKeyBundle.new(
    bob.identity.public_key,
    await bob.store.load_prekey(Proteus.keys.PreKey.MAX_PREKEY_ID)
  );
  const cipherMessage = await alice.encrypt(sessionWithBob, 'Hello', bobBundle.serialise());
  await bob.decrypt(sessionWithAlice, cipherMessage);

  return {alice, bob};
}

async function benchmark() {
  const {alice, bob} = await setup();

  const numbers = Array(messageCount)
    .fill(null)
    .map((value, key) => key + 1);

  process.stdout.write(`Measuring encryption time for ${numbers.length} messages ... `);
  const encryptionTimer = process.hrtime();
  const encryptedMessages = await Promise.all(
    numbers.map(
      async value => await alice.encrypt(sessionWithBob, `This is a long message with number ${value.toString()}`)
    )
  );

  const elapsedTimeEncryption = measure(encryptionTimer);
  process.stdout.write('Done.\n');
  console.log(`Execution time: ${elapsedTimeEncryption} seconds.\n`);

  process.stdout.write(`Measuring decryption time for ${numbers.length} messages ... `);
  const decryptionTimer = process.hrtime();
  await Promise.all(
    encryptedMessages.map(async encryptedMessage => await bob.decrypt(sessionWithAlice, encryptedMessage))
  );

  const elapsedTimeDecryption = measure(decryptionTimer);
  process.stdout.write('Done.\n');
  console.log(`Execution time: ${elapsedTimeDecryption} seconds.`);
}

(async () => {
  try {
    console.log('Setting up ...\n');

    await benchmark();
  } catch (error) {
    console.error(error.message, error);
  }
})();
