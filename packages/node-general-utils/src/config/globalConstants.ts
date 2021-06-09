/**
 * Montreal Global constants
 */
export class GlobalConstants {
  /**
   * Endpoint type roots.
   *
   * Those roots should probably never be changed, since some
   * of our operation components (Nginx / Kong / etc.) are
   * configured for them.
   */
  get EnpointTypeRoots() {
    return {
      API: '/api',
      DOCUMENTATION: '/documentation',
      DIAGNOSTICS: '/diagnostics'
    };
  }

  /**
   * Known environment types
   */
  get Environments() {
    return {
      LOCAL: 'local',
      /*
       * "development" seems to be the standard Node label, not "dev".
       * The node-config library uses this :
       * https://github.com/lorenwest/node-config/wiki/Configuration-Files#default-node_env
       */
      DEV: 'development',

      ACCEPTATION: 'acceptation',
      LAB: 'lab',
      /**
       * "production" seems to be the standard Node label, not "prod".
       */
      PROD: 'production'
    };
  }

  /**
   * Errors related constants
   */
  get errors() {
    return {
      /**
       * General API errors
       */
      apiGeneralErrors: {
        codes: {
          GENERIC_ERROR: 'serverError',
          NOT_FOUND: 'notFound',
          INVALID_PARAMETER: 'invalidParameter',
          INVALID_JSON_BODY: 'invalidJsonBody',
          DUPLICATE_KEY: 'duplicateKey',
          NOT_IMPLEMENTED: 'notImplemented',
          UNAUTHORIZED: 'unauthorized',
          UNPROCESSABLE_ENTITY: 'unprocessableEntity',
          FORBIDDEN: 'forbidden'
        }
      }
    };
  }

  /**
   * Environment variables
   */
  get envVariables() {
    return {
      /**
       * Environment type. The possible values are defined
       * in "Environments"
       * Do not change this :
       * https://github.com/lorenwest/node-config/wiki/Configuration-Files#default-node_env
       */
      ENV_TYPE: 'NODE_ENV',

      NODE_APP_INSTANCE: 'NODE_APP_INSTANCE'
    };
  }

  /**
   * Known app instances
   */
  get appInstances() {
    return {
      /**
       * App instance name to use when running local tests
       * in an API.
       * This allows local configs to be picked.
       */
      TESTS: 'tests'
    };
  }

  /**
   * Currently in testing mode?
   */
  get testingMode(): boolean {
    return process.env[this.envVariables.NODE_APP_INSTANCE] === this.appInstances.TESTS;
  }
}

export let globalConstants: GlobalConstants = new GlobalConstants();
