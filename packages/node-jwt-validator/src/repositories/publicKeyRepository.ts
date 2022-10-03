import { httpUtils } from '@villedemontreal/http-request';
import { isArray, keyBy } from 'lodash';
import * as superagent from 'superagent';

import { createError } from '@villedemontreal/general-utils';
import { configs } from '../config/configs';
import { constants } from '../config/constants';
import { IPaginatedResult } from '../models/pagination';
import { IPublicKey, IPublicKeys } from '../models/publicKey';

/**
 * Public Key repository
 */
export interface IPublicKeyRepository {
  /**
   * Return the last public keys
   * @return {Promise<IPublicKeys>}
   */
  getAll(): Promise<IPublicKeys>;

  /**
   * Returns one public key.
   * Returns null if not found.
   * @param {number} keyId
   * @return {Promise<IPublicKey>}
   */
  getOne(keyId: number): Promise<IPublicKey>;
}

class PublicKeyRepository implements IPublicKeyRepository {
  public async getAll(): Promise<IPublicKeys> {
    const url = `${httpUtils.urlJoin(
      configs.getHost(),
      configs.getEndpoint()
    )}?${configs.getFetchKeysParameters()}`;
    const request = superagent.get(url);

    const response = await httpUtils.send(request);
    if (!response.ok) {
      throw new Error(`An error occured calling ${url} : ${response.error}`);
    }

    const data: IPaginatedResult<IPublicKey> = response.body;
    if (data && data.items && isArray(data.items)) {
      const newKeys: IPublicKeys = keyBy(data.items, (item) => item.id);
      return newKeys;
    }
    return null;
  }

  public async getOne(keyId: number): Promise<IPublicKey> {
    const url = httpUtils.urlJoin(configs.getHost(), configs.getEndpoint(), keyId.toString());
    const request = superagent.get(url);

    const response = await httpUtils.send(request);
    if (!response.ok) {
      // ==========================================
      // Not found: we return null
      // ==========================================
      if (response.status === 404) {
        return null;
      }

      throw createError(
        constants.errors.codes.UNABLE_TO_GET_PUBLIC_KEY,
        `An error occured calling ${url} : ${response.error}`
      )
        .httpStatus(response.status)
        .build();
    }
    return response.body;
  }
}

export const publicKeyRepository: IPublicKeyRepository = new PublicKeyRepository();
