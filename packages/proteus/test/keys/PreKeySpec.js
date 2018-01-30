/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

/* eslint no-magic-numbers: "off" */

const assertThrowsAsync = async (fn, regExp) => {
  let f = () => {};
  try {
    await fn();
  } catch(e) {
    f = () => {throw e};
  } finally {
    assert.throws(f, regExp);
  }
}

describe('PreKey', () => {
  describe('Generation', () => {
    it('should generate new PreKeys', async done => {
      let pk = await Proteus.keys.PreKey.new(0);
      pk = await Proteus.keys.PreKey.last_resort();
      assert(pk.key_id === Proteus.keys.PreKey.MAX_PREKEY_ID);

      done();
    });

    it('should reject invalid PreKey IDs', async done => {
      await assertThrowsAsync(async () => await Proteus.keys.PreKey.new(undefined));
      await assertThrowsAsync(async () => await Proteus.keys.PreKey.new('foo'));
      await assertThrowsAsync(async () => await Proteus.keys.PreKey.new(-1));
      await assertThrowsAsync(async () => await Proteus.keys.PreKey.new(65537));
      await assertThrowsAsync(async () => await Proteus.keys.PreKey.new(4242.42));

      done();
    });

    it('throws errors with error codes', async done => {
      try {
        await Proteus.keys.PreKey.new(Proteus.keys.PreKey.MAX_PREKEY_ID + 1);
      } catch (error) {
        assert.instanceOf(error, Proteus.errors.InputError.RangeError);
        assert.strictEqual(error.code, Proteus.errors.InputError.CODE.CASE_400);
      }

      try {
        await Proteus.keys.PreKey.generate_prekeys(Proteus.keys.PreKey.MAX_PREKEY_ID + 1, 1);
      } catch (error) {
        assert.instanceOf(error, Proteus.errors.InputError.RangeError);
        assert.strictEqual(error.code, Proteus.errors.InputError.CODE.CASE_400);
      }

      done();
    });

    it('generates ranges of PreKeys', async done => {
      let prekeys = await Proteus.keys.PreKey.generate_prekeys(0, 0);
      assert.strictEqual(prekeys.length, 0);

      prekeys = await Proteus.keys.PreKey.generate_prekeys(0, 1);
      assert.strictEqual(prekeys.length, 1);
      assert(prekeys[0].key_id === 0);

      prekeys = await Proteus.keys.PreKey.generate_prekeys(0, 10);
      assert(prekeys.length === 10);
      assert(prekeys[0].key_id === 0);
      assert(prekeys[9].key_id === 9);

      prekeys = await Proteus.keys.PreKey.generate_prekeys(3000, 10);
      assert(prekeys.length === 10);
      assert(prekeys[0].key_id === 3000);
      assert(prekeys[9].key_id === 3009);

      done();
    });

    it('does not include the last resort pre key', async done => {
      let prekeys = await Proteus.keys.PreKey.generate_prekeys(65530, 10);
      assert(prekeys.length === 10);
      assert(prekeys[0].key_id === 65530);
      assert(prekeys[1].key_id === 65531);
      assert(prekeys[2].key_id === 65532);
      assert(prekeys[3].key_id === 65533);
      assert(prekeys[4].key_id === 65534);
      assert(prekeys[5].key_id === 0);
      assert(prekeys[6].key_id === 1);
      assert(prekeys[7].key_id === 2);
      assert(prekeys[8].key_id === 3);
      assert(prekeys[9].key_id === 4);

      prekeys = await Proteus.keys.PreKey.generate_prekeys(Proteus.keys.PreKey.MAX_PREKEY_ID, 1);
      assert.strictEqual(prekeys.length, 1);
      assert(prekeys[0].key_id === 0);
      done();
    });
  });

  describe('Serialisation', () => {
    it('should serialise and deserialise correctly', async done => {
      const pk = await Proteus.keys.PreKey.new(0);
      const pk_bytes = pk.serialise();
      const pk_copy = Proteus.keys.PreKey.deserialise(pk_bytes);

      assert(pk_copy.version === pk.version);
      assert(pk_copy.key_id === pk.key_id);
      assert(pk_copy.key_pair.public_key.fingerprint() === pk.key_pair.public_key.fingerprint());

      assert(sodium.to_hex(new Uint8Array(pk_bytes)) === sodium.to_hex(new Uint8Array(pk_copy.serialise())));

      done();
    });
  });
});
