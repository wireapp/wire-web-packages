const {Account} = require('../../../../../../../wire-web-core/dist/commonjs/index');

describe('Account', () => {
  describe('"constructor"', () => {
    it('creates a temporary client by default', () => {
      const account = new Account({email: 'me@wire.com', password: 'secret'});
      expect(account.loginData.persist).toBe(false);
    });

    it('sanitizes login data', () => {
      const account = new Account({email: 'me@wire.com\t', password: '\r\nsecret'});
      expect(account.loginData.email).toBe('me@wire.com');
      expect(account.loginData.password).toBe('secret');
    });

    it('turns a given password into a string', () => {
      const account = new Account({email: 'me@wire.com\t', password: 1234567890});
      expect(typeof account.loginData.password).toBe('string');
    });
  });
});
