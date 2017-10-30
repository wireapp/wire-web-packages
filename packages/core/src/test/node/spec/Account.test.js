const {Account} = require('../../../../dist/commonjs/');

describe('Account', () => {
  describe('"constructor"', () => {
    it('creates a temporary client by default', () => {
      const account = new Account({email: 'me@wire.com', password: 'secret'});
      expect(account.loginData.persist).toBe(false);
    });
  });
});
