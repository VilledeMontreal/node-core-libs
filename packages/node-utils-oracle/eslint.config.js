const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const prettier = require("eslint-plugin-prettier");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        parserOptions: {
            "project": ["./tsconfig.json"],
            "tsconfigRootDir": __dirname,
            "es6": true,
        },

        globals: {
            ...globals.node,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
        prettier,
    },

    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
    ),

    "rules": {
        "prettier/prettier": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@/prefer-template": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-unsafe-argument": "off",

        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/unbound-method": "off",
    },
}, globalIgnores([
    "**/.*",
    "node_modules",
    "test",
    "output",
    "dist",
    "temp",
    "test-*",
    "log",
    "html",
    "**/Jenkinsfile",
    "**/package.json",
    "**/package-lock.json",
    "**/yarn.lock",
    "**/README.md",
    "**/license",
    "**/*.map",
    "**/*.yaml",
    "**/*.hbs",
    "**/*.txt",
    "**/*.js",
])]);
