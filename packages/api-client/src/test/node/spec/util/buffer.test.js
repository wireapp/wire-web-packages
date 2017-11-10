const {base64MD5FromBuffer} = require('../../../../../dist/commonjs/shims/node/buffer');

describe('"base64MD5FromBuffer"', function() {
  it('can generate base64 encoded md5 hash from buffer', function() {
    expect(base64MD5FromBuffer(new Uint8Array([8, 8]))).toBe('w+7NCDwPSCf1JgWbA7deTA==');
  });
});
