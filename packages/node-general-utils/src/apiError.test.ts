// Disabling the "function length" rule is OK for the test files.
// tslint:disable:max-func-body-length
import { assert } from 'chai';

import { IApiError, isApiError } from './apiError';
import {
  createForbiddenError,
  createInvalidParameterError,
  createNotFoundError,
  createNotImplementedError,
  createServerError,
  createUnauthorizedError,
  createUnprocessableEntityError,
} from './apiErrorBuilder';
import { globalConstants } from './config/globalConstants';
import { LogLevel } from './logLevel';

// ==========================================
// API errors
// ==========================================
describe('API errors', () => {
  // ==========================================
  // Predefined errors
  // ==========================================
  describe('Predefined errors', () => {
    it('createServerError - default', async () => {
      const error = createServerError('myLogMessage');
      assert.strictEqual(error.httpStatus, 500);
      assert.strictEqual(error.logLevel, LogLevel.ERROR);
      assert.strictEqual(error.logMessage, 'myLogMessage');
      assert.strictEqual(error.logStackTrace, true);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.GENERIC_ERROR,
      );
      assert.strictEqual(error.error.message, 'Server error');
    });

    it('createServerError - custom', async () => {
      const error = createServerError('myLogMessage', 'myPublicMessage');
      assert.strictEqual(error.httpStatus, 500);
      assert.strictEqual(error.logLevel, LogLevel.ERROR);
      assert.strictEqual(error.logMessage, 'myLogMessage');
      assert.strictEqual(error.logStackTrace, true);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.GENERIC_ERROR,
      );
      assert.strictEqual(error.error.message, 'myPublicMessage');
    });

    it('createNotFoundError - default', async () => {
      const error = createNotFoundError('myLogMessage');
      assert.strictEqual(error.httpStatus, 404);
      assert.strictEqual(error.logLevel, LogLevel.DEBUG);
      assert.strictEqual(error.logMessage, 'myLogMessage');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(error.error.code, globalConstants.errors.apiGeneralErrors.codes.NOT_FOUND);
      assert.strictEqual(error.error.message, 'Not Found');
    });

    it('createNotFoundError - custom', async () => {
      const error = createNotFoundError('myLogMessage', 'myPublicMessage', LogLevel.INFO, true);
      assert.strictEqual(error.httpStatus, 404);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'myLogMessage');
      assert.strictEqual(error.logStackTrace, true);
      assert.strictEqual(error.error.code, globalConstants.errors.apiGeneralErrors.codes.NOT_FOUND);
      assert.strictEqual(error.error.message, 'myPublicMessage');
    });

    it('createInvalidParameterError - default', async () => {
      const error = createInvalidParameterError('myPublicMessage');
      assert.strictEqual(error.httpStatus, 400);
      assert.strictEqual(error.logLevel, LogLevel.DEBUG);
      assert.strictEqual(error.logMessage, 'myPublicMessage');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.INVALID_PARAMETER,
      );
      assert.strictEqual(error.error.message, 'myPublicMessage');
      assert.isTrue(error.error.details === undefined || error.error.details.length === 0);
    });

    it('createInvalidParameterError - custom', async () => {
      const details: IApiError[] = [
        {
          code: 'myDetailCode1',
          message: 'myDetailMessage1',
        },
        {
          code: 'myDetailCode2',
          message: 'myDetailMessage2',
        },
      ];

      const error = createInvalidParameterError('myPublicMessage', details, LogLevel.INFO, true);
      assert.strictEqual(error.httpStatus, 400);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'myPublicMessage');
      assert.strictEqual(error.logStackTrace, true);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.INVALID_PARAMETER,
      );
      assert.strictEqual(error.error.message, 'myPublicMessage');
      assert.strictEqual(error.error.details.length, 2);
      assert.strictEqual(error.error.details[0].code, 'myDetailCode1');
      assert.strictEqual(error.error.details[0].message, 'myDetailMessage1');
      assert.strictEqual(error.error.details[1].code, 'myDetailCode2');
      assert.strictEqual(error.error.details[1].message, 'myDetailMessage2');
    });

    it('createUnprocessableEntityError - default', async () => {
      const error = createUnprocessableEntityError('myPublicMessage');
      assert.strictEqual(error.httpStatus, 422);
      assert.strictEqual(error.logLevel, LogLevel.DEBUG);
      assert.strictEqual(error.logMessage, 'myPublicMessage');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.UNPROCESSABLE_ENTITY,
      );
      assert.strictEqual(error.error.message, 'myPublicMessage');
      assert.isTrue(error.error.details === undefined || error.error.details.length === 0);
    });

    it('createInvalidParameterError - custom', async () => {
      const details: IApiError[] = [
        {
          code: 'myDetailCode1',
          message: 'myDetailMessage1',
          target: 'aJsonPath',
        },
        {
          code: 'myDetailCode2',
          message: 'myDetailMessage2',
        },
      ];

      const error = createUnprocessableEntityError('myPublicMessage', details, LogLevel.INFO, true);
      assert.strictEqual(error.httpStatus, 422);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'myPublicMessage');
      assert.strictEqual(error.logStackTrace, true);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.UNPROCESSABLE_ENTITY,
      );
      assert.strictEqual(error.error.message, 'myPublicMessage');
      assert.strictEqual(error.error.details.length, 2);
      assert.strictEqual(error.error.details[0].code, 'myDetailCode1');
      assert.strictEqual(error.error.details[0].message, 'myDetailMessage1');
      assert.strictEqual(error.error.details[1].code, 'myDetailCode2');
      assert.strictEqual(error.error.details[1].message, 'myDetailMessage2');
    });

    it('createNotImplementedError - default', async () => {
      const error = createNotImplementedError();
      assert.strictEqual(error.httpStatus, 501);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'Not implemented');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.NOT_IMPLEMENTED,
      );
      assert.strictEqual(error.error.message, 'Not implemented yet');
    });

    it('createNotImplementedError - custom', async () => {
      const error = createNotImplementedError('myLogMessage', 'myPublicMessage');
      assert.strictEqual(error.httpStatus, 501);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'myLogMessage');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.NOT_IMPLEMENTED,
      );
      assert.strictEqual(error.error.message, 'myPublicMessage');
    });

    it('createUnauthorizedError - default', async () => {
      const error = createUnauthorizedError();
      assert.strictEqual(error.httpStatus, 401);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'Unauthorized');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.UNAUTHORIZED,
      );
      assert.strictEqual(error.error.message, 'Please authenticate yourself first.');
    });

    it('createUnauthorizedError - custom', async () => {
      const error = createUnauthorizedError('myLogMessage', 'myPublicMessage');
      assert.strictEqual(error.httpStatus, 401);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'myLogMessage');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(
        error.error.code,
        globalConstants.errors.apiGeneralErrors.codes.UNAUTHORIZED,
      );
      assert.strictEqual(error.error.message, 'myPublicMessage');
    });

    it('createForbiddenError - default', async () => {
      const error = createForbiddenError();
      assert.strictEqual(error.httpStatus, 403);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'Forbidden');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(error.error.code, globalConstants.errors.apiGeneralErrors.codes.FORBIDDEN);
      assert.strictEqual(error.error.message, 'Access denied.');
    });

    it('createForbiddenError - custom', async () => {
      const error = createForbiddenError('myLogMessage', 'myPublicMessage');
      assert.strictEqual(error.httpStatus, 403);
      assert.strictEqual(error.logLevel, LogLevel.INFO);
      assert.strictEqual(error.logMessage, 'myLogMessage');
      assert.strictEqual(error.logStackTrace, false);
      assert.strictEqual(error.error.code, globalConstants.errors.apiGeneralErrors.codes.FORBIDDEN);
      assert.strictEqual(error.error.message, 'myPublicMessage');
    });
  });

  // ==========================================
  // isApiError
  // ==========================================
  describe('isApiError', () => {
    it('is an ApiError', async () => {
      for (const value of [
        {
          code: 'some code',
          message: 'some message',
        },
        {
          code: 'some code',
          message: 'some message',
          details: [],
        },
        {
          code: 'some code',
          message: 'some message',
          target: 'target',
        },
      ] as any) {
        assert.isTrue(isApiError(value));
      }
    });

    it('is not an ApiError', async () => {
      for (const value of [
        {
          code: 'some code',
        },
        {
          message: 'some message',
        },
        {
          code: 'some code',
          message: 'some message',
          nope: 'nope',
        },
        {
          code: 'some code',
          message: 'some message',
          target: 'target',
          details: [],
          innererror: {
            code: 'some code',
          },
          nope: 123,
        },
      ] as any) {
        assert.isFalse(isApiError(value));
      }
    });
  });
});
