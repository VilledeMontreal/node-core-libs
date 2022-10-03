/**
 * Extend Express Request object
 */
import * as express from 'express';
import * as _ from 'lodash';
import { constants } from '../config/constants';
import { IJWTPayload } from '../models/jwtPayload';

export interface IRequestWithJwt extends express.Request {
  /**
   * The JSON Web Token of the request.
   */
  jwt: IJWTPayload;
}

/**
 * Request with JWT Type Guard
 */
export const isRequestWithJwt = (obj: any): obj is IRequestWithJwt => {
  return (
    obj &&
    _.isObject(obj) &&
    'get' in obj &&
    'headers' in obj &&
    constants.requestExtraVariables.JWT in obj
  );
};
