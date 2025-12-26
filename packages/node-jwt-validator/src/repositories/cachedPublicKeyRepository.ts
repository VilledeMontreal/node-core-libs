import { ApiErrorAndInfo } from '@villedemontreal/general-utils/dist/src';
import { extend } from 'lodash';
import { DateTime } from 'luxon';
import { configs } from '../config/configs';
import { IPublicKey, IPublicKeys } from '../models/publicKey';
import { createLogger } from '../utils/logger';
import { IPublicKeyRepository, publicKeyRepository } from './publicKeyRepository';
const logger = createLogger('CachedPublicKeyRepository');

/**
 * Cached Public Key repository
 */
export interface ICachedPublicKeyRepository extends IPublicKeyRepository {
  /**
   * Clears the public keys in cache
   */
  clearCache(): void;
}

export class CachedPublicKeyRepository implements ICachedPublicKeyRepository {
  /**
   * Next update
   */
  private _nextUpdate: DateTime;

  /**
   * Cached public keys
   */
  private _cachedKeys: IPublicKeys = {};

  /**
   * Clears the public keys in cache
   */
  public clearCache(): void {
    this._cachedKeys = {};
    this._nextUpdate = DateTime.utc();
  }

  /**
   * Return the last public keys
   * @return {Promise<IPublicKeys>}
   */
  public async getAll(): Promise<IPublicKeys> {
    if (!this.isValidCache()) {
      const keysList: IPublicKeys = await publicKeyRepository.getAll();

      if (keysList) {
        this.updateNextCacheUpdate();
        this._cachedKeys = extend(this._cachedKeys, keysList);
      }
    }
    return this._cachedKeys;
  }

  /**
   * Return one public key
   * @param {number} keyId
   * @return {Promise<IPublicKey>}
   */
  public async getOne(keyId: number): Promise<IPublicKey> {
    if (!this._cachedKeys[keyId] || !this.isValidCache()) {
      // In case of network error while getting key, return the cached one
      try {
        const key: IPublicKey = await publicKeyRepository.getOne(keyId);
        if (key) {
          this.updateNextCacheUpdate();
          this._cachedKeys[keyId] = key;
        }
      } catch (err) {
        if (!this._cachedKeys[keyId] || !this.isTransientError(err)) {
          throw err;
        }
        logger.error(
          JSON.stringify(err),
          `[getOne] There was an error getting key ${keyId}, cached value was sent as result`,
        );
      }
    }
    return this._cachedKeys[keyId];
  }

  /**
   * Check if the error is a network error, server error or
   * If true, do not throw error
   * @return {boolean}
   */
  private isTransientError(err: any): boolean {
    if (err instanceof ApiErrorAndInfo) {
      if (err.httpStatus >= 500 || err.httpStatus === 429) return true;
      return false;
    }
    // No status on a superagent network error
    if (!err.status) return true;
    const errStatus: number = +err.status;
    if (errStatus >= 500 || errStatus === 429) return true;
    return false;
  }

  /**
   * Check if the cache is stil valid
   * @return {boolean}
   */
  private isValidCache(): boolean {
    if (!this._nextUpdate || DateTime.utc() >= this._nextUpdate) {
      return false;
    }

    return true;
  }

  /**
   * Update the date of the next update
   * @return
   */
  private updateNextCacheUpdate(): void {
    this._nextUpdate = DateTime.utc().plus({ seconds: configs.getCacheDuration() });
  }
}

export const cachedPublicKeyRepository: ICachedPublicKeyRepository =
  new CachedPublicKeyRepository();
