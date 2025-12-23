import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Request, Response } from 'express';
import { createRequest as createRequestMock } from 'node-mocks-http';
import { SinonSpy, SinonStub, spy, stub } from 'sinon';
import { jwtValidator } from '../jwtValidator';
import { IRequestWithJwt } from '../models/expressRequest';
import { IJWTPayload } from '../models/jwtPayload';
import { jwtValidationMiddleware } from './jwtMiddleware';

chai.use(chaiAsPromised);

describe('#jwtValidationMiddleware', () => {
  let middleware: ReturnType<typeof jwtValidationMiddleware>;
  let nextFunction: SinonSpy = spy();
  let verifyMethod: SinonStub;
  let jwt: IJWTPayload;
  let authorizationHeader: string;
  let request: Request;
  let response: Response;

  before(() => {
    nextFunction = spy();
    jwt = {
      sub: '1234567890',
      name: 'Peter Neighbor',
      iat: 1694264949,
    } as IJWTPayload;
    authorizationHeader = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBldGVyIE5laWdoYm9yIiwiaWF0IjoxNjk0MjY0OTQ5fQ.ncai230HG-KbDL2ximBZz29Smt-yOFBgZYrJTmQreqA`;
  });

  beforeEach(() => {
    nextFunction.resetHistory();
    request = createRequestMock({
      method: 'GET',
      url: '/',
      headers: { Authorization: authorizationHeader },
    });
    response = {} as Response;
  });

  afterEach(() => {
    verifyMethod?.restore();
  });

  const DELAY = 50;

  it('should invoke #verifyAuthorizationHeader with authorization header', async function () {
    // Cf. https://mochajs.org/api/mocha#slow
    this.slow(2 * DELAY + 10 /* budgeted test duration */);

    // GIVEN
    middleware = jwtValidationMiddleware();
    request = createRequestMock({
      method: 'GET',
      url: '/',
      headers: { Authorization: authorizationHeader },
    });
    verifyMethod = stub(jwtValidator, 'verifyAuthorizationHeader').returns(
      delay(DELAY).then(() => jwt),
    );

    // WHEN
    await middleware(request, response, nextFunction);

    // THEN
    expect(verifyMethod.callCount).to.equal(1);
    expect(verifyMethod.args[0]).to.deep.equal([authorizationHeader]);
    expect(nextFunction.callCount).to.equal(1);
    expect(nextFunction.args[0]).to.deep.equal([]);
    expect((request as IRequestWithJwt).jwt).to.equal(jwt);
  });

  it('should *NOT* invoke #verifyAuthorizationHeader *WITHOUT* authorization header and "mandatory" trigger being *OFF*', async () => {
    // GIVEN
    middleware = jwtValidationMiddleware(false);
    request.headers = {}; // ∅
    verifyMethod = stub(jwtValidator, 'verifyAuthorizationHeader').returns(
      delay(50).then(() => jwt),
    );

    // WHEN
    await middleware(request, response, nextFunction);

    // THEN
    expect(verifyMethod.callCount).to.equal(0);
    expect(nextFunction.callCount).to.equal(1);
    expect(nextFunction.args[0]).to.deep.equal([]);
    expect((request as IRequestWithJwt).jwt).to.be.undefined;
  });

  it('should fail synchronously if #verifyAuthorizationHeader does so', async () => {
    // GIVEN
    middleware = jwtValidationMiddleware();
    const error: Error = new Error('💣');
    verifyMethod = stub(jwtValidator, 'verifyAuthorizationHeader').throws(error);

    // WHEN
    const operation = () => middleware(request, response, nextFunction);

    // THEN
    expect(operation).not.to.throw();
    expect(verifyMethod.callCount).to.equal(1);
    expect(verifyMethod.args[0]).to.deep.equal([authorizationHeader]);
    expect(nextFunction.callCount).to.equal(1);
    expect(nextFunction.args[0]).to.deep.equal([error]);
    expect((request as IRequestWithJwt).jwt).to.be.undefined;
  });

  it('should fail *ASYNCHRONOUSLY* if #verifyAuthorizationHeader does so', async () => {
    // GIVEN
    middleware = jwtValidationMiddleware();
    const error: Error = new Error('💣');
    verifyMethod = stub(jwtValidator, 'verifyAuthorizationHeader').returns(
      delay(50).then(() => {
        throw error;
      }),
    );

    // WHEN
    const promise = middleware(request, response, nextFunction);

    // THEN
    await expect(promise).not.to.be.eventually.rejected;
    expect(verifyMethod.callCount).to.equal(1);
    expect(verifyMethod.args[0]).to.deep.equal([authorizationHeader]);
    expect(nextFunction.callCount).to.equal(1);
    expect(nextFunction.args[0]).to.deep.equal([error]);
    expect((request as IRequestWithJwt).jwt).to.be.undefined;
  });
});

async function delay(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}
