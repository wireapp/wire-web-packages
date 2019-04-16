module.exports = {
  "env": {
    "jasmine": true,
  },
  "extends": ["@wireapp/eslint-config", "plugin:no-unsanitized/DOM", "plugin:react/recommended"],
  "plugins": [
    "jasmine",
    "no-unsanitized",
    "react"
  ],
  "rules": {
    "no-magic-numbers": [
      2,
      {
        "ignore": [-1, 0, 1]
      }
    ],
    "react/prefer-stateless-function": 2,
    "react/prop-types": 0,
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};
