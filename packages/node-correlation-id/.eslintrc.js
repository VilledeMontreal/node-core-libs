const baseConfig = require('../../.eslintrc.base.js');

module.exports = {
  ...baseConfig,
  "rules": {
    ...baseConfig.rules,
    "@typescript-eslint/await-thenable" : "off",
    "prefer-spread": "off",
    "@typescript-eslint/no-empty-function" : "off",
  },
}
