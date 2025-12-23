import {
  ApiErrorAndInfo,
  createInvalidParameterError,
  createServerError,
} from '@villedemontreal/general-utils/dist/src';
import { assert } from 'chai';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as nock from 'nock';
import * as validator from 'validator';
import { configs } from './config/configs';
import { constants } from './config/constants';
import { jwtValidator } from './jwtValidator';
import { isRequestWithJwt } from './models/expressRequest';
import { IPublicKeys } from './models/publicKey';
import { cachedPublicKeyRepository } from './repositories/cachedPublicKeyRepository';
import { jwtMock } from './utils/jwtMock';
import { setTestingConfigurations } from './utils/testingConfigurations';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const httpMocks = require('node-mocks-http');

// ==========================================
// Set Testing configurations
// ==========================================
setTestingConfigurations();

// ==========================================
// JWT Validator
// ==========================================
let date;
let publicKeys: IPublicKeys;

function createPathRegex() {
  const regExpEscape = (s: any) => {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  return new RegExp(`${regExpEscape(configs.getEndpoint())}(.*)`);
}

before('JWT Validator - init app & get jwt public key', async () => {
  nock.cleanAll();

  // Use mock keys
  await jwtMock.mockPublicKeys();

  publicKeys = await cachedPublicKeyRepository.getAll();

  assert.match(publicKeys[1].publicKey, /^-----BEGIN PUBLIC KEY-----\n/m);
  assert.match(publicKeys[1].publicKey, /^-----BEGIN PUBLIC KEY-----\n/m);
  assert.match(publicKeys[1].publicKey, /\n-----END PUBLIC KEY-----$/m);

  const key: string = publicKeys[1].publicKey
    .replace(/^-----BEGIN PUBLIC KEY-----\n/m, '')
    .replace(/\n-----END PUBLIC KEY-----$/m, '')
    .split('\n')
    .join('');
  assert.isTrue(validator.default.isBase64(key));
});

it('JWT Validator - verifyHeader - should reject null header', async () => {
  const response = await jwtValidator.verifyAuthorizationHeader(null).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_AUTHORIZATION_HEADER);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid Authorization header');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.NULL_VALUE);
    assert.strictEqual(err.error.details[0].target, 'Authorization header');
    assert.strictEqual(err.error.details[0].message, 'Empty Authorization header');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verifyHeader - should reject empty header', async () => {
  const response = await jwtValidator.verifyAuthorizationHeader('').catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_AUTHORIZATION_HEADER);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid Authorization header');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.NULL_VALUE);
    assert.strictEqual(err.error.details[0].target, 'Authorization header');
    assert.strictEqual(err.error.details[0].message, 'Empty Authorization header');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verifyHeader - should reject unknow authentication scheme', async () => {
  const response = await jwtValidator.verifyAuthorizationHeader('Unknow JWT').catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_AUTHORIZATION_HEADER);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid Authorization header');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'Authorization header');
    assert.strictEqual(
      err.error.details[0].message,
      'Bad authentication scheme, "Bearer" required',
    );
  });

  assert.isUndefined(response);
});

it('JWT Validator - verifyHeader - should reject bad token', async () => {
  const response = await jwtValidator.verifyAuthorizationHeader('Bearer JWT').catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'jwt malformed');
  });

  assert.isUndefined(response);
});
it('JWT Validator - verifyHeader - should accept good token', async () => {
  date = new Date(publicKeys[5].createdAt);
  date.setHours(date.getHours() + 24);
  const payload: any = {
    accessToken: 'c9ba5a95-d7f9-41f9-9a24-a7e41882f7ef',
    iss: 'Issuer',
    inum: 'MyInum',
    iat: date.getTime() / 1000,
    exp: date.getTime() / 1000 + 3600,
    sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
    keyId: 5,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyAuthorizationHeader(`Bearer ${token}`);

  assert.deepEqual(response, payload);
});

it('JWT Validator - verify - should reject bad token', async () => {
  const response = await jwtValidator.verifyToken('JWT').catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'jwt malformed');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject invalid token: missing signature', async () => {
  let token = '';
  token += Buffer.from('{}', 'base64').toString();
  token += '.';
  token += Buffer.from('{}', 'base64').toString();
  token += '.';

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'jwt malformed');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject invalid token: empty JSON', async () => {
  let token = '';
  token += Buffer.from('{}', 'base64').toString();
  token += '.';
  token += Buffer.from('{}', 'base64').toString();
  token += '.';
  token += 'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'jwt malformed');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject invalid token: missing public key ID', async () => {
  const token: string = jwt.sign('{"a":"a"}', 'key', { algorithm: 'HS256' });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'missing public key ID');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject invalid token: keyId is no longer active', async () => {
  const token: string = jwt.sign('{"a":"a", "keyId": "1"}', 'key', { algorithm: 'HS256' });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'this keyId is no longer active');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject invalid token: keyId not found', async () => {
  const pathRegex = createPathRegex();

  // Intercept request
  nock(configs.getHost()).get(pathRegex).reply(404);

  const token: string = jwt.sign('{"a":"a", "keyId": "25"}', 'key', { algorithm: 'HS256' });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'this keyId is no longer active');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject invalid algorithm: bad signature', async () => {
  let token = '';
  token += Buffer.from('{"alg":"HS256","typ":"JWT"}', 'base64').toString();
  token += '.';
  token += Buffer.from('{"a":"a", "keyId": 5}', 'base64').toString();
  token += '.';
  token += 'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'jwt malformed');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject invalid algorithm: bad signature (algorithm)', async () => {
  const token: string = jwt.sign('{"a":"a", "keyId": 5}', 'key', { algorithm: 'HS256' });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'invalid algorithm');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject expired token', async () => {
  date = new Date(publicKeys[5].createdAt);
  date.setHours(date.getHours() + 24);
  const payload: any = {
    b: 'b',
    iat: date.getTime() / 1000,
    exp: 1,
    keyId: 5,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'jwt expired');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject expired public key', async () => {
  const payload: any = {
    b: 'b',
    keyId: 2,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'this keyId is expired');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject expired public key (by state)', async () => {
  const payload: any = {
    b: 'b',
    keyId: 1,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'this keyId is no longer active');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject revoked public key', async () => {
  const payload: any = {
    b: 'b',
    keyId: 3,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'this keyId is no longer active');
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject jwt created after the expiration date of the key', async () => {
  date = new Date(publicKeys[4].expiresAt);
  date.setHours(date.getHours() + 24);
  const payload: any = {
    b: 'b',
    iat: date.getTime() / 1000,
    keyId: 4,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(
      err.error.details[0].message,
      "this jwt can't be created after the expiration of the public key",
    );
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should reject jwt created before the creation date of the key', async () => {
  date = new Date(publicKeys[4].createdAt);
  date.setHours(date.getHours() - 48);
  const payload: any = {
    b: 'b',
    iat: date.getTime() / 1000,
    keyId: 4,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(
      err.error.details[0].message,
      "this jwt can't be created before the public key",
    );
  });

  assert.isUndefined(response);
});

it('JWT Validator - verify - should accept good token', async () => {
  date = new Date();
  const payload: any = {
    accessToken: 'c9ba5a95-d7f9-41f9-9a24-a7e41882f7ef',
    iss: 'Issuer',
    inum: 'MyInum',
    iat: date.getTime() / 1000,
    exp: date.getTime() / 1000 + 3600,
    sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
    keyId: 4,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });

  const response = await jwtValidator.verifyToken(token);

  assert.deepEqual(response, payload);
});

it('isRequestWithJwt', async () => {
  const req: express.Request = httpMocks.createRequest({ method: 'GET', url: '/' });
  assert.isFalse(isRequestWithJwt(req));

  (req as any)[constants.requestExtraVariables.JWT] = 'Bonjour la police';
  assert.isTrue(isRequestWithJwt(req));
});

it('JWT Validator - unable to get public key', async () => {
  const pathRegex = createPathRegex();

  // Intercept request
  nock(configs.getHost()).get(pathRegex).reply(500);

  const token: string = jwt.sign('{"a":"a", "keyId": "25"}', 'key', { algorithm: 'HS256' });

  const response = await jwtValidator.verifyToken(token).catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.UNABLE_TO_GET_PUBLIC_KEY);
    assert.strictEqual(err.httpStatus, 500);
  });

  assert.isUndefined(response);
});

it('JWT Validator - network error - should accept good token if cached', async function () {
  this.timeout(70000); // Timeout should be longer on Windows
  // Invalidate cache
  const currentNextUpdate = (cachedPublicKeyRepository as any)._nextUpdate;
  (cachedPublicKeyRepository as any)._nextUpdate = undefined;

  const pathRegex = createPathRegex();

  // Intercept request
  nock(configs.getHost()).get(pathRegex).replyWithError({ code: 'ABORTED' });

  date = new Date();
  const payload: any = {
    accessToken: 'c9ba5a95-d7f9-41f9-9a24-a7e41882f7ef',
    iss: 'Issuer',
    inum: 'MyInum',
    iat: date.getTime() / 1000,
    exp: date.getTime() / 1000 + 3600,
    sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
    keyId: 4,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });
  const response = await jwtValidator.verifyToken(token);
  assert.deepEqual(response, payload);

  (cachedPublicKeyRepository as any)._nextUpdate = currentNextUpdate;
});

it('JWT Validator - 500 error from api - should accept good token if cached', async () => {
  // Invalidate cache
  const currentNextUpdate = (cachedPublicKeyRepository as any)._nextUpdate;
  (cachedPublicKeyRepository as any)._nextUpdate = undefined;

  const pathRegex = createPathRegex();

  // Error from api
  // Intercept request
  nock(configs.getHost())
    .get(pathRegex)
    .reply(500, createServerError('Error while sending request'));

  date = new Date();
  const payload: any = {
    accessToken: 'c9ba5a95-d7f9-41f9-9a24-a7e41882f7ef',
    iss: 'Issuer',
    inum: 'MyInum',
    iat: date.getTime() / 1000,
    exp: date.getTime() / 1000 + 3600,
    sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
    keyId: 4,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });
  const response = await jwtValidator.verifyToken(token);
  assert.deepEqual(response, payload);

  (cachedPublicKeyRepository as any)._nextUpdate = currentNextUpdate;
});

it('JWT Validator - 429 error from api - should accept good token if cached', async () => {
  // Invalidate cache
  const currentNextUpdate = (cachedPublicKeyRepository as any)._nextUpdate;
  (cachedPublicKeyRepository as any)._nextUpdate = undefined;

  const pathRegex = createPathRegex();

  // Error from api
  // Intercept request
  nock(configs.getHost()).get(pathRegex).reply(429);

  date = new Date();
  const payload: any = {
    accessToken: 'c9ba5a95-d7f9-41f9-9a24-a7e41882f7ef',
    iss: 'Issuer',
    inum: 'MyInum',
    iat: date.getTime() / 1000,
    exp: date.getTime() / 1000 + 3600,
    sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
    keyId: 4,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });
  const response = await jwtValidator.verifyToken(token);
  assert.deepEqual(response, payload);

  (cachedPublicKeyRepository as any)._nextUpdate = currentNextUpdate;
});

it('JWT Validator - 400 error from api - should reject', async () => {
  // Invalidate cache
  const currentNextUpdate = (cachedPublicKeyRepository as any)._nextUpdate;
  (cachedPublicKeyRepository as any)._nextUpdate = undefined;

  const pathRegex = createPathRegex();

  // Error from api
  // Intercept request
  nock(configs.getHost())
    .get(pathRegex)
    .reply(400, createInvalidParameterError('Something is wrong'));

  date = new Date();
  const payload: any = {
    accessToken: 'c9ba5a95-d7f9-41f9-9a24-a7e41882f7ef',
    iss: 'Issuer',
    inum: 'MyInum',
    iat: date.getTime() / 1000,
    exp: date.getTime() / 1000 + 3600,
    sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.0001',
    keyId: 4,
  };
  const token: string = jwt.sign(JSON.stringify(payload), jwtMock.getPrivateKey(), {
    algorithm: 'RS256',
  });
  let error;
  try {
    await jwtValidator.verifyToken(token);
  } catch (e) {
    error = e;
  }
  assert.isDefined(error);
  assert.instanceOf(error, ApiErrorAndInfo);
  (cachedPublicKeyRepository as any)._nextUpdate = currentNextUpdate;
});

it('JWT Validator - network error - should reject bad token anyway', async () => {
  // Invalidate cache
  const currentNextUpdate = (cachedPublicKeyRepository as any)._nextUpdate;
  (cachedPublicKeyRepository as any)._nextUpdate = undefined;

  const pathRegex = createPathRegex();

  // Intercept request
  nock(configs.getHost()).get(pathRegex).replyWithError({ code: 'ABORTED' });

  const response = await jwtValidator.verifyToken('JWT').catch((err) => {
    assert.strictEqual(err.error.code, constants.errors.codes.INVALID_JWT);
    assert.strictEqual(err.error.target, 'Authorization header');
    assert.strictEqual(err.error.message, 'Invalid JWT');
    assert.strictEqual(err.error.details[0].code, constants.errors.codes.INVALID_VALUE);
    assert.strictEqual(err.error.details[0].target, 'jwt');
    assert.strictEqual(err.error.details[0].message, 'jwt malformed');
  });

  assert.isUndefined(response);
  (cachedPublicKeyRepository as any)._nextUpdate = currentNextUpdate;
});
