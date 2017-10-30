const {isValidKey, isValidToken} = require('../../../../../dist/commonjs/asset/AssetUtil');

describe('"isValidToken"', function() {
  it('should return true if token is valid', function() {
    expect(isValidToken('xA-1TVMs83zq8s4NtfTItQ==')).toBeTruthy();
  });

  it('should return false if token is not valid', function() {
    expect(isValidToken('xA-1TVMs83zq8s4NtfTItQ==.')).toBeFalsy();
    expect(isValidToken('xA-1TVMs83zq8s4NtfTItQ==!')).toBeFalsy();
    expect(isValidToken('xA-1TVMs83zq8s4NtfTItQ==ö')).toBeFalsy();
  });
});

describe('"isValidKey"', function() {
  it('should return true if key is valid', function() {
    expect(isValidKey('3-2-1e33cc4b-a003-4fd3-b980-ba077fc189ff')).toBeTruthy();
  });

  it('should return false if key is not valid', function() {
    expect(isValidKey('3-2-1e33cc4b-a003-4fd3-b980-ba077fc189ff!')).toBeFalsy();
    expect(isValidKey('3-2-1e33cc4b-a003-4fd3-b980-ba077fc189ff.')).toBeFalsy();
    expect(isValidKey('3-2-1e33cc4b-a003-4fd3-b980-ba077fc189ffö')).toBeFalsy();
  });
});
