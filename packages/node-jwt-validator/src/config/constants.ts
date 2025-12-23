// ==========================================
// Application constants
// ==========================================
import { path as appRoot } from 'app-root-path';
import * as path from 'path';

/**
 * Library constants
 */
export class Constants {
  /**
   * The library root. When this library is used
   * as a dependency in a project, the "libRoot"
   * will be the path to the dependency folder,
   * inside the "node_modules".
   */
  public libRoot: string;

  /**
   * The app root. When this library is used
   * as a dependency in a project, the "appRoot"
   * will be the path to the root project!
   */
  public appRoot: string;

  constructor() {
    // From the "dist/src/config" folder
    this.libRoot = path.normalize(path.join(__dirname, '../../..'));
    this.appRoot = appRoot;
  }

  /**
   * Errors related constants
   */
  get errors() {
    return {
      codes: {
        // Main Code
        INVALID_HEADER: 'invalidHeader',
        ACCOUNT_ALREADY_EXISTS: 'accountAlreadyExists',
        ACCOUNT_NOT_FOUND: 'accountNotFound',
        ACCOUNT_ALREADY_VERIFIED: 'accountAlreadyVerified',
        INVALID_AUTHORIZATION_HEADER: 'invalidAuthorizationHeader',
        INVALID_JWT: 'invalidJWT',
        CODE_NOT_FOUND: 'codeNotFound',
        CODE_EXPIRED: 'codeExpired',
        PHONE_NOT_FOUND: 'phoneNotFound',
        UNABLE_TO_GET_PUBLIC_KEY: 'unableToGetPublicKey',

        // Value Code
        NULL_VALUE: 'nullValue',
        INVALID_VALUE: 'invalidValue',
        INVALID_EMAIL_VALUE: 'invalidEmailValue',
        UNAUTHORIZED_ACCESS: 'unauthorizedAccess',

        // Information Code
        TEST_REMAINING: 'testRemaining',
      },
    };
  }

  /**
   * Extra values that we can add to the original Express request.
   */
  get requestExtraVariables() {
    return {
      JWT: 'jwt',
    };
  }

  /**
   * Default values
   */
  get default() {
    return {
      endpoint: '/api/security/v1/keys',
      fetchKeysParameters: 'state=active&state=revoked&offset=0&limit=25',
      cacheDuration: 60 * 5,
    };
  }
}

export const constants: Constants = new Constants();
