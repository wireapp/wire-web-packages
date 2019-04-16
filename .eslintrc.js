module.exports = {
  "env": {
    "jasmine": true,
  },
  "extends": ["@wireapp/eslint-config", "plugin:no-unsanitized/DOM"],
  "plugins": [
    "jasmine",
    "no-unsanitized",
  ],
  "rules": {
    "no-magic-numbers": [
      2,
      {
        "ignore": [-1, 0, 1]
      }
    ],
  },
};
