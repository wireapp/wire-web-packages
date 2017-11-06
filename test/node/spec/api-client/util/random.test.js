const {unsafeAlphanumeric} = require('../../../../../dist/commonjs/shims/node/random');

describe('"unsafeAlphanumeric"', function() {
  it('should generate string of length 32 as default', function() {
    expect(unsafeAlphanumeric(32).length).toBe(32);
  });

  it('should generate string for the given length', function() {
    expect(unsafeAlphanumeric(10).length).toBe(10);
  });
});
