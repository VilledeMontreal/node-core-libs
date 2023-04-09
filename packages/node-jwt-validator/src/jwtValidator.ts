import { utils } from '@villedemontreal/general-utils';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { constants } from './config/constants';
import { createInvalidAuthHeaderError, createInvalidJwtError } from './models/customError';
import { IJWTPayload, isJWTPayload } from './models/jwtPayload';
import { IPublicKey, PublicKeyState } from './models/publicKey';
import { cachedPublicKeyRepository } from './repositories/cachedPublicKeyRepository';

/**
 * JWT validator
 */
export interface IJwtValidator {
  /**
   * Verifies an "Authorization" header containing a JWT, checks
   * the JWT with the public key and returns the decoded payload.
   *
   * @param {string} header
   * @return {Promise<IJWTPayload>}
   */
  verifyAuthorizationHeader(header: string): Promise<IJWTPayload>;

  /**
   * Verifies a JWT with the public key and returns the decoded payload.
   * @param {string} token
   * @return {Promise<IJWTPayload>}
   */
  verifyToken(token: string): Promise<IJWTPayload>;
}

/**
 * JWT Validator
 */
class JwtValidator implements IJwtValidator {
  public async verifyAuthorizationHeader(header: string): Promise<IJWTPayload> {
    if (utils.isBlank(header)) {
      throw createInvalidAuthHeaderError({
        code: constants.errors.codes.NULL_VALUE,
        target: 'Authorization header',
        message: 'Empty Authorization header',
      });
    }

    const parts: string[] = header.trim().split(' ');
    if (parts[0] !== 'Bearer') {
      throw createInvalidAuthHeaderError({
        code: constants.errors.codes.INVALID_VALUE,
        target: 'Authorization header',
        message: 'Bad authentication scheme, "Bearer" required',
      });
    }

    return await this.verifyToken(parts[1]);
  }

  public async verifyToken(token: string): Promise<IJWTPayload> {
    const payload = this.parseJwt(token);

    const key = await this.getJwtPublicKey(payload);

    this.validateJwtCreationTimestamp(payload, key);
    this.validateJwtExpirationTimestamp(payload, key);

    return this.verifyJwt(token, key);
  }

  private parseJwt(token: string): IJWTPayload {
    const payload: IJWTPayload = jwt.decode(token) as IJWTPayload;
    if (!payload) {
      throw createInvalidJwtError({
        code: constants.errors.codes.INVALID_VALUE,
        target: 'jwt',
        message: 'jwt malformed',
      });
    }
    return payload;
  }

  private verifyJwt(token: string, publicKey: IPublicKey): IJWTPayload {
    let payload: any;
    try {
      payload = jwt.verify(token, publicKey.parsedPublicKey ?? publicKey.publicKey);
    } catch (err) {
      throw createInvalidJwtError({
        code: constants.errors.codes.INVALID_VALUE,
        target: 'jwt',
        message: err.message,
      });
    }

    if (isJWTPayload(payload)) {
      return payload;
    }
    throw createInvalidJwtError({
      code: constants.errors.codes.INVALID_VALUE,
      target: 'jwt',
      message: 'expected a valid JWT payload',
    });
  }

  private async getJwtPublicKey(payload: IJWTPayload): Promise<IPublicKey> {
    const keyId = payload.keyId;
    if (!keyId || keyId <= 0) {
      throw createInvalidJwtError({
        code: constants.errors.codes.INVALID_VALUE,
        target: 'jwt',
        message: 'missing public key ID',
      });
    }

    const key: IPublicKey = await cachedPublicKeyRepository.getOne(keyId);

    // Check key state
    if (!key || key.state !== PublicKeyState.ACTIVE) {
      throw createInvalidJwtError({
        code: constants.errors.codes.INVALID_VALUE,
        target: 'jwt',
        message: 'this keyId is no longer active',
      });
    }
    return key;
  }

  private validateJwtCreationTimestamp(payload: IJWTPayload, key: IPublicKey) {
    // Check the jwt was not created before the creation date of the key
    const payloadIat: moment.Moment = moment.utc(payload.iat * 1000);
    const keyCreatedAt: moment.Moment = moment.utc(key.createdAt);
    if (payloadIat.diff(keyCreatedAt) < 0) {
      throw createInvalidJwtError({
        code: constants.errors.codes.INVALID_VALUE,
        target: 'jwt',
        message: "this jwt can't be created before the public key",
      });
    }
  }

  private validateJwtExpirationTimestamp(payload: IJWTPayload, key: IPublicKey) {
    // Check expiration date
    if (key.expiresAt) {
      const keyexpiresAt: moment.Moment = moment.utc(key.expiresAt);
      if (moment.utc().diff(keyexpiresAt) > 0) {
        throw createInvalidJwtError({
          code: constants.errors.codes.INVALID_VALUE,
          target: 'jwt',
          message: 'this keyId is expired',
        });
      }

      // Check the jwt was not created after the expiration date of the key
      const payloadIat: moment.Moment = moment.utc(payload.iat * 1000);
      if (payloadIat.diff(keyexpiresAt) > 0) {
        throw createInvalidJwtError({
          code: constants.errors.codes.INVALID_VALUE,
          target: 'jwt',
          message: "this jwt can't be created after the expiration of the public key",
        });
      }
    }
  }
}

export const jwtValidator: IJwtValidator = new JwtValidator();
