import * as jwt from 'jsonwebtoken';
import { defaults } from 'lodash';
// import * as nock from 'nock';
import { configs } from '../config/configs';
import { IJWTPayload } from '../models/jwtPayload';
import { IPublicKey, PublicKeyState } from '../models/publicKey';
import { cachedPublicKeyRepository } from '../repositories/cachedPublicKeyRepository';

let nock: any;

const nockPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
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
d+msuQKCAQEAmRgOZQ3P8gwqWtt8w9u/F5S3JdS2STFIq3pmpPw4EZOwLwdOvlYm
B37kZ54jVcIEgXUguH43e3YSNskWNwRlsMFt2DV6EpwXg+byvKF4qg0PXOQfGfX7
pKf/BrF+DbMg41pmhwqBHmqXC3wlczV6VwnaD5M8hVdBO9fOVgmzZ+DnsZ+KExXK
nvjTCmaExsMshySMAiI0bvhDU+7EqqiPih619Vb9VrNYtPnAWuds+m5BNaMWI0JM
MEdr7SyCIpBM+wuh5En3oRxmfo1gBua4glw7sOF6AGWZE43yQk0oA/r7/asRr9Vo
HF/VMN05EXzv+kH+ZVWmmoz84MO+OSPyIQKCAQB/PQFqV3GXlBGquogBwpJdjzQW
CHzj+mIisON8v6g0MUu2a9+NrmKdJW1rzyVqhWIBqO2ofiurGXzQXNZsFVAg0Xht
NdAqYCmQX3jyskyE/5BakngLXo68JrtA+uvUX4mcMYcOObB/tSKI2lvFZSPBv8Gq
S119McwKIVEPmY5jJRF9c4xPI9efLIKaPS0mHnDC35p3nlpOgKZVU+VtoMnJ5jaf
qoSOL0ApbhS0nojAB0GlwvrV3rKLZN3Mp1wC2VO4Dp/HfQznMentg45HdZJwrM/7
8GEYuQ/feBBx2OBY4CPzvibxEFbiOY4Ss9ER8i/XmnSzzhP0YrMwZQi+CX3u
-----END RSA PRIVATE KEY-----`;

const nockPublicKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAzVZZXij6LgAUuH6ZcvGM
vskXj+a8T5uBkvFFEPnTdRN7dYdWrhxeqsDkvwpyxJehMRAANCP+AYXgLE2BA7qt
u0SCW+Hj+1+ZubQqwaD/EQtk72yU04rJw4YfDg6VyQbSdUQRQ7ktjVitglj4dBZA
x99O+4guId52bRZrqSLe4OUVeRSI6tSV6n7ta+vsvPxUdAylFI9mAlh2we7vAu18
X7cC/5Rzq4NIuHhWpkOwwE6h7RUu7oqWfpNYl+Ugzp7qgd/vosP4FtDTW0+N82Jj
iuKILc1bWicynv5ka22R4wNrGewPGDCyTckogxrUYkx80YFad4UBF2hGzTDfXng4
gIU61eJTiB5gy3t6AgHHaVbDPnGZIefPlE+4A35Ics4uIV1z5Kbmq2+aaP+YXE42
a/WoYJfkXqOHs1PjIJmVj/szVRKyKbpq9Qp3xIM+YZQlYUvgql/O6vbl5N1NbkV3
Cjpp+zknfYXmSUJ+0FGK/ZGcFRmOSeLyJnULeFS5EAF7CUnLMEfi0hFEiyOXSngT
BIPL2GKsvtliZvPS78ik2mfXyG0YJQiVM7hYyRV+AnudI0Pz/zjX2DvjM0s3jMeI
om+l3zpAZ4SmFDkKzhAvuxoSl2koH+VXm9QtsRFSZQwF3/K5l3Zx0yi1e16dMOWw
YPtMOiCbEausVW7wgzdoj+kCAwEAAQ==
-----END PUBLIC KEY-----`;

let date = new Date();

date.setHours(-1);

date.setMonth(date.getMonth() - 1);
const lastMonth = date.toISOString();

date.setMonth(date.getMonth() - 1);
const expiredDate = date.toISOString();

date = new Date();
date.setMonth(date.getMonth() + 1);
const newCreatedDate = date.toISOString();
date.setHours(date.getHours() + 1);
const newExpiredDate = date.toISOString();

const nocKPublicKeyExpired: IPublicKey = {
  id: 1,
  algorithm: 'RSA256',
  publicKey: nockPublicKey,
  state: PublicKeyState.EXPIRED,
  createdAt: expiredDate,
  expiresAt: lastMonth,
};
const nocKPublicKeyExpiredNotState: IPublicKey = {
  id: 2,
  algorithm: 'RSA256',
  publicKey: nockPublicKey,
  state: PublicKeyState.ACTIVE,
  createdAt: expiredDate,
  expiresAt: lastMonth,
};
const nocKPublicKeyRevoked: IPublicKey = {
  id: 3,
  algorithm: 'RSA256',
  publicKey: nockPublicKey,
  state: PublicKeyState.REVOKED,
  createdAt: lastMonth,
  expiresAt: newExpiredDate,
};
const nocKPublicKeyActiveOld: IPublicKey = {
  id: 4,
  algorithm: 'RSA256',
  publicKey: nockPublicKey,
  state: PublicKeyState.ACTIVE,
  createdAt: lastMonth,
  expiresAt: newExpiredDate,
};
const nocKPublicKeyActive: IPublicKey = {
  id: 5,
  algorithm: 'RSA256',
  publicKey: nockPublicKey,
  state: PublicKeyState.ACTIVE,
  createdAt: newCreatedDate,
};

const nockListPublicKeys: any = {
  paging: {
    limit: 25,
    offset: 0,
    totalCount: 5,
  },
  items: [
    nocKPublicKeyExpired,
    nocKPublicKeyExpiredNotState,
    nocKPublicKeyRevoked,
    nocKPublicKeyActiveOld,
    nocKPublicKeyActive,
  ],
};

const regExpEscape = (s: any) => {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const pathRegex = new RegExp(`${regExpEscape(configs.getEndpoint())}(.*)`);

/**
 * Tools to mock JWT
 */
export class JwtMock {
  /**
   * Return a public key from the mock db
   */
  public getPublicKey(keyId: number): IPublicKey {
    const key: IPublicKey = nockListPublicKeys.items[keyId - 1];

    return key;
  }

  /**
   * Return the public keys from the mock db
   */
  public getPublicKeys(): IPublicKey[] {
    return nockListPublicKeys.items;
  }

  /**
   * Return the private keys from the mock db
   */
  public getPrivateKey(): string {
    return nockPrivateKey;
  }

  /**
   * Flush the public keys in cache and add the mocked public keys
   */
  public async mockPublicKeys(options?: any): Promise<void> {
    cachedPublicKeyRepository.clearCache();

    // Intercept request
    if (!nock) {
      // Note that we lazy-load the nock module
      // until we really need it, to avoid patching
      // the http module for nothing.
      nock = require('nock');
    }
    nock(configs.getHost(), options).get(pathRegex).once().reply(200, nockListPublicKeys);

    await cachedPublicKeyRepository.getAll();
  }

  /**
   * Generate a fake JWT signed with the mocked keys
   */
  public generateJwt(jwtProperties = {}): string {
    const jwtPayload: IJWTPayload = defaults(jwtProperties, {
      accessToken: 'c9ba5a95-d7f9-41f9-9a24-a7e41882f7ef',
      iss: 'jwt-mock',

      // From Introspect
      exp: Date.now() + 3600,
      iat: Date.now(),
      keyId: 5,

      // From ClientInfo
      displayName: 'Service Account',
      aud: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0008!2212.0010',

      // From UserInfo
      name: 'Guillaume Smaha',
      sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
      inum: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
      userName: 'xsmahgu@ville.montreal.qc.ca',
      givenName: 'Guillaume',
      familyName: 'Smaha',
      userType: '',
      mtlIdentityId: '100-qwerty-azerty-dvorak',
    });

    const jwtSigned: string = jwt.sign(jwtPayload, nockPrivateKey, {
      algorithm: 'RS256',
    });

    return jwtSigned;
  }

  /**
   * Deletes all mocks and also clears the cache
   */
  public cleanAll(): void {
    nock.cleanAll();
    cachedPublicKeyRepository.clearCache();
  }
}
export const jwtMock: JwtMock = new JwtMock();
