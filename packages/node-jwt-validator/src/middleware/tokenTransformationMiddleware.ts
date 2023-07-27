import { utils } from '@villedemontreal/general-utils';
import * as express from 'express';
import httpHeaderFieldsTyped from 'http-header-fields-typed';
import { constants } from '../config/constants';
import { ITokenTtransformationMiddlewareConfig } from '../config/tokenTransformationMiddlewareConfig';
import { createInvalidAuthHeaderError, createInvalidJwtError } from '../models/customError';
import { createLogger } from '../utils/logger';
import superagent = require('superagent');

const _regexAccessToken = /([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})/;

const logger = createLogger('Token transformation middleware');

/**
 * Token transformation Middleware. It will generate extended jwt
 * in exchange for an access token.
 *
 * @param {boolean} config Configuration of the middleware.
 */
export const tokenTransformationMiddleware: (
  config?: ITokenTtransformationMiddlewareConfig
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (
  config
) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    try {
      // Validate the authorization header
      const authHeader: string = req.get(httpHeaderFieldsTyped.AUTHORIZATION);
      if (utils.isBlank(authHeader)) {
        throw createInvalidAuthHeaderError({
          code: constants.errors.codes.INVALID_VALUE,
          target: 'authorization_header',
          message: 'authorization header is empty',
        });
      }

      // Extract the access token value from the authorization header
      const accessTokenRegExpArray = _regexAccessToken.exec(authHeader);
      if (accessTokenRegExpArray.length <= 1) {
        throw createInvalidAuthHeaderError({
          code: constants.errors.codes.INVALID_VALUE,
          target: 'access_token',
          message: 'could not find a valid access token from the authorization header',
        });
      }
      const accessToken = accessTokenRegExpArray[1];

      // Call the service endpoint to exchange the access token for a extended jwt
      superagent
        .post(config.service.uri)
        .send({ accessToken, extensions: config.extensions })
        .then((response) => {
          const extendedJwt = response.body.jwts?.extended;
          logger.debug(extendedJwt, 'Extended jwt content.');

          const basicJwt = response.body.jwts?.basic;
          logger.debug(basicJwt, 'Basic jwt content.');

          // Get the extended jwt. If not available, fallback to basic jwt.
          const jwt = extendedJwt ?? basicJwt;

          if (jwt) {
            // Warning: Headers are all in lowercase. To be sure to replace
            // the authorization header instead of duplicate it, must use lower case property name.
            req.headers[httpHeaderFieldsTyped.AUTHORIZATION.toLowerCase()] = `Bearer ${jwt}`;
            logger.debug(req.headers, 'Request headers');
            next();
          } else {
            const err = createInvalidJwtError({
              code: constants.errors.codes.NULL_VALUE,
              target: 'jwt',
              message: 'could not get a valid jwt from token translation service',
            });
            next(err);
          }
        })
        .catch((err) => next(err));
    } catch (err) {
      next(err);
    }
  };
};
