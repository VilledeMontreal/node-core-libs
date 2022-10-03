import * as _ from 'lodash';

/**
 * A JWT payload
 */
export interface IJWTPayload {
  // TODO more comments on those properties!

  accessToken: string;
  iss: string;

  // JWT information
  // From Introspect
  exp: number;
  iat: number;
  keyId: number;

  // From ClientInfo
  displayName: string;
  aud: string;

  // From UserInfo
  name: string;
  sub: string;

  /**
   * @deprecated Please use mtlIdentityId or userName instead.
   */
  inum: string;

  userName: string;
  givenName: string;
  familyName: string;
  userType: string;
  email?: string;

  // Corresponds to oro identity-id or inum
  mtlIdentityId?: string;
  // available only for employees
  employeeNumber?: string;
  customData?: any;
}

/**
 * IJWTPayload Type Guard
 */
export const isJWTPayload = (obj: any): obj is IJWTPayload => {
  return (
    obj &&
    _.isObject(obj) &&
    'accessToken' in obj &&
    'iss' in obj &&
    'exp' in obj &&
    'iat' in obj &&
    'sub' in obj &&
    'keyId' in obj
  );
};
