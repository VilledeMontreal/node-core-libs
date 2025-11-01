# Release Notes

## 2025-11-01

- Added this file to better track the changes.
- In order to have up to date and safe code, we will identify all deprecated libraries we depend on and either replace them with a new one,
  or fork them and update them ourselves. Also, some libraries have peer dependencies constraints that prevent us from upgrading and will force us to fork them too.
- Fork github.com/mattallty/Caporal.js because the project seems to be abandoned and it is a corner stone of our scripting lib.
- Fork https://github.com/juhovh/mocha-jenkins-reporter because it is 2 years old and its peer dependencies prevent us from upgrading to Mocha 11.
- NodeJS now emits a security warning when we execute a shell command with a specific overload (command and args as an array), so we added an option
  to escape the args automatically (false by default).
- BREAKING: The scripting lib will use the new escapeArgs option by default in its executeShellCommand method.
- BREAKING: The scripting lib will use the forked Caporal lib and the forked mocha-jenkins-reporter, so you need to update your package.json
  with our forked version.
- upgrade dependencies of all libs.
- move lib core-utils-knex-nodejs-lib from Bitbucket to this mono repo, to facilitate updates.
- Upgrade Knex from 2.5.1 to latest version 3.1.0. I didn't have any breaking change in the unit tests but it might still happen since we changed the major version.
