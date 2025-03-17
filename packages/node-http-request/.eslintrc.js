const baseConfig = require('../../.eslintrc.base.js');

module.exports = {
  ...baseConfig,
  "rules": {
    ...baseConfig.rules,
    "@typescript-eslint/no-floating-promises": "off",
  },
}
