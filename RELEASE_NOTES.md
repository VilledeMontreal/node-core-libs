# Release Notes

## 2026-01-24

### Changes

- Upgrade superagent from 10.2.3 to 10.3.0
- Upgrade Pino from 10.1.0 to 10.3.0
- Upgrade Mongoose from 9.0.2 to 9.1.5

## 2025-12-29

As of today, there is no warning produced by npm when installing all packages!
And there is no known security vulnerability reported by npm audit!

### Changes

- remove unnecessary type definitions: @types/uuid, @types/nock, @types/http-status-codes, @types/app-root-path, 
- remove deprecated package http-header-fields-typed
- remove rimraf package and use modern NodeJS APIs.
- replace package nyc with c8, because it is more modern and it relies on NodeJS native profiling.
- Replace sqlite3 by better-sqlite3 because sqlite depended on old package versions,
  which generated warnings during installation.
- Replace tabtab package by @pnpm/tabtab, a modern version maintained by the pnpm team. 
  This change resolves critical vulnerabilities related to the tmp dependency present in 
  the older version of tabtab. This change was proposed and done by gemini-cli.

### BREAKING

- add constraint for NodeJS to be greater than or equal to 24 (current LTS version), for all libs

## 2025-12-26

Please note that this release was mostly performed thanks to gemini-cli (gemini-3-flash-preview).
I was really impressed with the quality of the proposed changes, espcially when replacing 
moment with luxon!

### Changes

- Upgrade eslint to the latest version. 
- Fix eslint issues.
- Discovered that project node-jwt-validator was not properly running all the available unit tests!
  This is because the src/**/*.test.ts pattern will ignore test files that right inside the src folder!
- Upgrade all other dependencies to their latest version.
  It means that our libs might start using some ESM only libs, but thanks to NodeJS 24 and more,
  this should be transparent.
- replace MomentJS with Luxon in node-jwt-validator
- move utils-oracle lib from Bitbucket to this Github monorepo. 
  You will have to replace your imports: @villemontreal/core-utils-oracle-nodejs-lib ==> @villedemontreal/utils-oracle


### BREAKING

The following changes might break your code:
- upgrade mongodb from 6.20.0 to 7.0.0. See https://github.com/mongodb/node-mongodb-native/releases/tag/v7.0.0
- upgrade mongoose from 8.20.2 to 9.0.2. See https://github.com/Automattic/mongoose/releases/tag/9.0.0
- upgrade mongodb-memory-server-core from 10.4.1 to 11.0.1. See https://github.com/typegoose/mongodb-memory-server/releases/tag/v11.0.0
- replace MomentJS with Luxon in node-general-utils (if you still need moment, you'll have to import it in your project or better, replace it too)
- move @types/x imports from the dependencies to the devDependencies section. It should never have been there.
  It might break your project but hopefully not.

### Fixes

- Fix bug in node-general-utils/timer/getMillisecondsElapsed where the conversion mixed start and end segments, leading to wrong nanoseconds computation (found by gemini-cli).

## 2025-12-13

- upgrade mongoose from 8.20.1 to 8.20.2
- upgrade mongodb-memory-server-core from 10.3.0 to 10.4.1
- use path.join() instead of string concatenation

## 2025-12-02

- upgrade mongoose from 8.19.3 to 8.20.0
- upgrade express from 5.1.0 to 5.2.1
- enhance utils.shellescape to handle both linux and windows shells
- revert utils.shellescape to escaping only, without trying to detect if it is already escaped.
- in ScriptBase.invokeShellCommand, disable escapeArgs option by default, to avoid any breaking change
- replace invokeShellCommand with **execa**, which better deals with args and local nodejs tools.

## 2025-11-09

- BREAKING: upgrade @types/express from 4.17.25 to 5.0.5
- upgrade mongodb-memory-server-core from 10.2.3 to 10.3.0
- upgrade mongoose from 8.19.2 to 8.19.3
- upgrade pino from 9.14.0 to 10.1.0, pino-pretty from 11.3.0 to 13.1.2
- upgrade nock from 13.5.6 to 14.0.10

## 2025-11-01

- Added this file to better track the changes.
- In order to have up to date and safe code, we will identify all deprecated libraries we depend on and either replace them with a new one,
  or fork them and update them ourselves. Also, some libraries have peer dependencies constraints that prevent us from upgrading and will force us to fork them too.
- Fork github.com/mattallty/Caporal.js because the project seems to be abandoned and it is a corner stone of our scripting lib.
- Fork https://github.com/juhovh/mocha-jenkins-reporter because it is 2 years old and its peer dependencies prevent us from upgrading to Mocha 11.
- NodeJS now emits a security warning when we execute a shell command with a specific overload (command and args as an array), 
  so we added an option to escape the args automatically (false by default).
- BREAKING: The scripting lib will use the new escapeArgs option by default in its executeShellCommand method.
- BREAKING: The scripting lib will use the forked Caporal lib and the forked mocha-jenkins-reporter, so you need to update your package.json
  with our forked version.
- upgrade dependencies of all libs.
- move lib core-utils-knex-nodejs-lib from Bitbucket to this mono repo, to facilitate updates.
- Upgrade Knex from 2.5.1 to latest version 3.1.0. I didn't have any breaking change in the unit tests but it might still happen since we changed the major version.
