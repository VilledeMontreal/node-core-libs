import * as express from 'express';
import httpHeaderFieldsTyped from 'http-header-fields-typed';
import { jwtValidator } from '../jwtValidator';
import { IRequestWithJwt } from '../models/expressRequest';

/**
 * JWT validation Middleware
 *
 * @param {boolean} mandatoryValidation Defines if the JWT is mandatory. Defaults to true.
 */
export const jwtValidationMiddleware =
  (mandatoryValidation = true) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    try {
      const authHeader: string = req.get(httpHeaderFieldsTyped.AUTHORIZATION);
      if (mandatoryValidation || authHeader) {
        return jwtValidator
          .verifyAuthorizationHeader(authHeader)
          .then((jwt) => {
            (req as IRequestWithJwt).jwt = jwt;
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
