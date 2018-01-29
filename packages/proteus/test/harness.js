process.env.NODE_PATH = './dist/commonjs';
require('module').Module._initPaths();

assert = require('chai').assert;

global.sodium = require('libsodium-wrappers-sumo');

Proteus = require('proteus');

Proteus.derived = {
  CipherKey: require('proteus/derived/CipherKey').default,
  DerivedSecrets: require('proteus/derived/DerivedSecrets').default,
  MacKey: require('proteus/derived/MacKey').default,
};

Proteus.message.SessionTag = require('proteus/message/SessionTag').default;

Proteus.util = {
  ArrayUtil: require('proteus/util/ArrayUtil').default,
  KeyDerivationUtil: require('proteus/util/KeyDerivationUtil').default,
  MemoryUtil: require('proteus/util/MemoryUtil').default,
  TypeUtil: require('proteus/util/TypeUtil').default,
};
