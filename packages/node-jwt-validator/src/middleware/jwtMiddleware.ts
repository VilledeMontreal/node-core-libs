import * as express from 'express';
import httpHeaderFieldsTyped from 'http-header-fields-typed';
import { constants } from '../config/constants';
import { jwtValidator } from '../jwtValidator';

/**
 * JWT validation Middleware
 *
 * @param {boolean} mandatoryValidation Defines if the JWT is mandatory. Defaults to true.
 */
export const jwtValidationMiddleware: (
  mandatoryValidation?: boolean
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (
  mandatoryValidation = true
) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    try {
      const authHeader: string = req.get(httpHeaderFieldsTyped.AUTHORIZATION);
      if (mandatoryValidation || authHeader) {
        jwtValidator
          .verifyAuthorizationHeader(authHeader)
          .then((jwt) => {
            (req as any)[constants.requestExtraVariables.JWT] = jwt;
            next();
          })
          .catch((err) => {
            next(err);
          });
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  };
};
