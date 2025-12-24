import { utils } from '@villedemontreal/general-utils';
import * as express from 'express';
import httpHeaderFieldsTyped from 'http-header-fields-typed';
import * as _ from 'lodash';
import { configs } from '../config/configs';
import { constants } from '../config/constants';
import { ITokenTtransformationMiddlewareConfig } from '../config/tokenTransformationMiddlewareConfig';
import { IInputAccessToken, IInputAccessTokenSource } from '../models/accessToken';
import { createInvalidJwtError } from '../models/customError';
import { createLogger } from '../utils/logger';
import * as superagent from 'superagent';

const logger = createLogger('Token transformation middleware');

/** Regex to test the UUID format of the Authorization header */
const _regexUuidAccessToken = /([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})/;
/** Regex to test the JWT format of the Authorization header */
const _regexJwtAccessToken = /([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]+)$/;

/**
 * Validate the access_token format from authorization header and return it.
 *
 * @param {string} authHeader
 * @return {*}  {string}
 */
const getAccessTokenFromHeader = (authHeader: string): string | null => {
  if (authHeader.split(' ')[0] !== 'Bearer') {
    logger.warning('The authorization header is not "Bearer" type.');
    return null;
  }
  const accessTokenUuidRegExpArray = _regexUuidAccessToken.exec(authHeader);
  const accessTokenJwtRegExpArray = _regexJwtAccessToken.exec(authHeader);
  if (_.isNil(accessTokenUuidRegExpArray) && _.isNil(accessTokenJwtRegExpArray)) {
    logger.warning('Could not find a valid access token from the authorization header');
    return null;
  }
  if (!_.isNil(accessTokenJwtRegExpArray)) {
    return accessTokenJwtRegExpArray[0];
  } else {
    return accessTokenUuidRegExpArray[0];
  }
};

/**
 * Token transformation Middleware. It will generate extended jwt
 * in exchange for an access token.
 *
 * @param {boolean} config Configuration of the middleware.
 */
export const tokenTransformationMiddleware: (
  config?: ITokenTtransformationMiddlewareConfig,
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (
  config,
) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    try {
      // Validate the authorization header
      const authHeader = req.get(httpHeaderFieldsTyped.AUTHORIZATION);
      if (utils.isBlank(authHeader)) {
        logger.warning('The authorization header is empty.');
        next();
        return;
      }

      // Extract the access token value from the authorization header
      const accessToken = getAccessTokenFromHeader(authHeader);
      if (_.isNil(accessToken)) {
        next();
        return;
      }

      const source: IInputAccessTokenSource = {
        url: `${req.protocol}://${req?.headers.host}${req.url}`,
        method: req.method,
        serviceName: configs.getSourceProjectName(),
        clientIp: '10.0.0.1',
      };

      const inputAccessToken: IInputAccessToken = {
        accessToken,
        source,
        extensions: config.extensions,
      };

      // Call the service endpoint to exchange the access token for a extended jwt
      superagent
        .post(config.service.uri)
        .send(inputAccessToken)
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
