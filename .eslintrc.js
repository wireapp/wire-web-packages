module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "jasmine": true,
    "node": true
  },
  "extends": ["prettier", "plugin:no-unsanitized/DOM", "plugin:react/recommended"],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "experimentalObjectRestSpread": true
    }
  },
  "plugins": [
    "jasmine",
    "no-unsanitized",
    "prettier",
    "react"
  ],
  "rules": {
    "curly": 2,
    "dot-notation": 2,
    "id-length": 2,
    "no-console": [
      2,
      {
        "allow": ["error", "info"]
      }
    ],
    "no-undef": 2,
    "no-const-assign": 2,
    "no-dupe-class-members": 2,
    "no-else-return": 2,
    "no-inner-declarations": 2,
    "no-lonely-if": 2,
    "no-magic-numbers": [
      2,
      {
        "ignore": [-1, 0, 1]
      }
    ],
    "no-shadow": 2,
    "no-unneeded-ternary": 2,
    "no-unused-expressions": 2,
    "no-unused-vars": [
      2,
      {
        "args": "none"
      }
    ],
    "no-useless-return": 2,
    "no-var": 2,
    "one-var": [2, "never"],
    "prefer-arrow-callback": 2,
    "prefer-const": 2,
    "prefer-promise-reject-errors": 2,
    "prettier/prettier": 2,
    "react/prefer-stateless-function": 2,
    "react/prop-types": 0,
    "sort-imports": 2,
    "sort-keys": [
      2,
      "asc",
      {
        "caseSensitive": true,
        "natural": true
      }
    ],
    "sort-vars": 2,
    "strict": [2, "global"]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};
