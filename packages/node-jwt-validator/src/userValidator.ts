import * as express from 'express';
import { constants } from './config/constants';
import { createInvalidJwtError } from './models/customError';
import { IRequestWithJwt, isRequestWithJwt } from './models/expressRequest';

export interface IUserValidator {
  /**
   * TODO commentaire pas à jour
   * Verify a header containg a jwt and check the jwt with the public key and returns the decoded payload
   * @param {string} userId
   * @return {void}
   */
  isUser(userId: string): boolean;

  /**
   * TODO commentaire pas à jour
   * Verify a header containg a jwt and check the jwt with the public key and returns the decoded payload
   * @param {string} userId
   * @return {void}
   */
  verifyUser(userId: string): void;
}

/**
 * User Validator
 */
export class UserValidator implements IUserValidator {
  private _request: IRequestWithJwt;

  /**
   * Create a new instance of UserValidator
   * @param {express.Request} req
   */
  public constructor(req: express.Request) {
    if (!isRequestWithJwt(req)) {
      throw new Error(`Expecting a request with a '.jwt' here! : ${req.method} ${req.url}`);
    }
    this._request = req;
  }

  public isUser(userId: string) {
    return this._request.jwt.sub !== userId;
  }

  public verifyUser(userId: string) {
    if (this._request.jwt.sub !== userId && this._request.jwt.mtlIdentityId !== userId) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw createInvalidJwtError({
        code: constants.errors.codes.UNAUTHORIZED_ACCESS,
        target: 'jwt',
        message: 'Unauthorized access',
      });
    }
  }
}
