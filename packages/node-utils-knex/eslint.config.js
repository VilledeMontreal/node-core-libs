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
        // "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-ternary": "off",

        "@typescript-eslint/restrict-template-expressions": ["off", {
            "allowAny": true,
        }],

        // "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/unbound-method": "off",
        // "@typescript-eslint/no-unnecessary-type-assertion": "off",

        // "@typescript-eslint/ban-types": ["off", {
        //     "types": {
        //         "{}": true,
        //     },

        //     "extendDefaults": true,
        // }],

        // "no-async-promise-executor": "off",
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
