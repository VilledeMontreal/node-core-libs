// ==========================================
// Interfaces and classes related to errors
// to be sent in response to an API request.
//
// It is recommended that you use the provided
// builder to create an error. This builder can be
// started by using the exported "createError()"
// function.
//
// The structure of those errors is based on
// https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#7102-error-condition-responses
//
// ==========================================
import * as HttpStatusCodes from 'http-status-codes';

import { ApiErrorAndInfo, IApiError, IApiInnerError } from './apiError';
import { globalConstants } from './config/globalConstants';
import { LogLevel } from './logLevel';

/**
 * Builder to create errors.
 */
export class ErrorBuilder {
  private _code: string;
  private _logMessage: any;
  private _publicMessage: string;
  private _target: string;
  private _details: IApiError[];
  private _innererror: IApiInnerError;
  private _httpStatus: number;
  private _logLevel: LogLevel;
  private _logStackTrace: boolean;

  /**
   * Constructor
   * The error node and log message are mandatory.
   */
  constructor(code: string, logMessage: any) {
    this._code = code;
    this._logMessage = logMessage;
  }

  public publicMessage = (publicMessage: string): ErrorBuilder => {
    this._publicMessage = publicMessage;
    return this;
  };

  public target = (target: string): ErrorBuilder => {
    this._target = target;
    return this;
  };

  public details = (details: IApiError[]): ErrorBuilder => {
    this._details = details;
    return this;
  };

  public addDetail = (detail: IApiError): ErrorBuilder => {
    if (!this._details) {
      this._details = [];
    }
    this._details.push(detail);
    return this;
  };

  public innererror = (innererror: IApiInnerError): ErrorBuilder => {
    this._innererror = innererror;
    return this;
  };

  public httpStatus = (httpStatus: number): ErrorBuilder => {
    this._httpStatus = httpStatus;
    return this;
  };

  public logLevel = (logLevel: LogLevel): ErrorBuilder => {
    this._logLevel = logLevel;
    return this;
  };

  public logStackTrace = (logStackTrace: boolean): ErrorBuilder => {
    this._logStackTrace = logStackTrace;
    return this;
  };

  /**
   * Builds the error!
   */
  public build = (): ApiErrorAndInfo => {
    const error: IApiError = {
      code: this._code,
      message: this._publicMessage || 'An error occured',
    };

    if (this._target !== undefined) {
      error.target = this._target;
    }

    if (this._details && this._details.length > 0) {
      error.details = this._details;
    }

    if (this._innererror !== undefined) {
      error.innererror = this._innererror;
    }

    const errorAndInfo: ApiErrorAndInfo = new ApiErrorAndInfo(
      error,
      this._logMessage,
      this._httpStatus || HttpStatusCodes.INTERNAL_SERVER_ERROR,
      this._logLevel !== undefined ? this._logLevel : LogLevel.ERROR,
      this._logStackTrace !== undefined ? this._logStackTrace : true,
    );

    return errorAndInfo;
  };
}

/**
 * ErrorBuilder Type Guard
 */
export const isErrorBuilder = (obj: any): obj is ErrorBuilder => {
  return obj && obj.addDetail !== undefined && obj.build !== undefined;
};

/**
 * Starts a builder to create an error.
 */
export function createError(code: string, logMessage: any): ErrorBuilder {
  const builder: ErrorBuilder = new ErrorBuilder(code, logMessage);
  return builder;
}

/**
 * Easily creates a generic internal server error (500)
 *
 * The log message is mandatory.
 */
export function createServerError(
  logMessage: any,
  publicMessage = 'Server error',
): ApiErrorAndInfo {
  return createError(globalConstants.errors.apiGeneralErrors.codes.GENERIC_ERROR, logMessage)
    .httpStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR)
    .publicMessage(publicMessage)
    .logLevel(LogLevel.ERROR)
    .logStackTrace(true)
    .build();
}

/**
 * Easily creates a Not Found error (404)
 *
 * @param logMessage The message to log.
 * @param publicMessage The message to return in the error.
 * @param logLevel The log level to use.
 * @param logStackTrace Should the stack trace be logged?
 */
export function createNotFoundError(
  logMessage: any,
  publicMessage = 'Not Found',
  logLevel: LogLevel = LogLevel.DEBUG,
  logStackTrace = false,
): ApiErrorAndInfo {
  return createError(globalConstants.errors.apiGeneralErrors.codes.NOT_FOUND, logMessage)
    .httpStatus(HttpStatusCodes.NOT_FOUND)
    .publicMessage(publicMessage)
    .logLevel(logLevel)
    .logStackTrace(logStackTrace)
    .build();
}

/**
 * Easily creates an invalid parameter error (400)
 *
 * @param publicMessage The message to return in the error (will also be logged).
 * @param details Some additional information about the validation that failed.
 * @param logLevel The log level to use.
 * @param logStackTrace Should the stack trace be logged?
 */
export function createInvalidParameterError(
  publicMessage: string,
  details: IApiError[] = [],
  logLevel: LogLevel = LogLevel.DEBUG,
  logStackTrace = false,
): ApiErrorAndInfo {
  return createError(globalConstants.errors.apiGeneralErrors.codes.INVALID_PARAMETER, publicMessage)
    .httpStatus(HttpStatusCodes.BAD_REQUEST)
    .publicMessage(publicMessage)
    .details(details)
    .logLevel(logLevel)
    .logStackTrace(logStackTrace)
    .build();
}

/**
 * Easily creates an unprocessable entity error (422)
 *
 * @param publicMessage The message to return in the error (will also be logged).
 * @param details Some additional information about the validation that failed.
 * @param logLevel The log level to use.
 * @param logStackTrace Should the stack trace be logged?
 */
export function createUnprocessableEntityError(
  publicMessage: string,
  details: IApiError[] = [],
  logLevel: LogLevel = LogLevel.DEBUG,
  logStackTrace = false,
): ApiErrorAndInfo {
  return createError(
    globalConstants.errors.apiGeneralErrors.codes.UNPROCESSABLE_ENTITY,
    publicMessage,
  )
    .httpStatus(HttpStatusCodes.UNPROCESSABLE_ENTITY)
    .publicMessage(publicMessage)
    .details(details)
    .logLevel(logLevel)
    .logStackTrace(logStackTrace)
    .build();
}

/**
 * Easily creates an "Not Implemented" error (501)
 */
export function createNotImplementedError(
  logMessage: any = 'Not implemented',
  publicMessage = 'Not implemented yet',
) {
  return createError(globalConstants.errors.apiGeneralErrors.codes.NOT_IMPLEMENTED, logMessage)
    .publicMessage(publicMessage)
    .httpStatus(HttpStatusCodes.NOT_IMPLEMENTED)
    .logLevel(LogLevel.INFO)
    .logStackTrace(false)
    .build();
}

/**
 * Easily creates an "Unauthorized" error (401). To throw when
 * the user *is not authenticated*.
 */
export function createUnauthorizedError(
  logMessage: any = 'Unauthorized',
  publicMessage = 'Please authenticate yourself first.',
) {
  return createError(globalConstants.errors.apiGeneralErrors.codes.UNAUTHORIZED, logMessage)
    .publicMessage(publicMessage)
    .httpStatus(HttpStatusCodes.UNAUTHORIZED)
    .logLevel(LogLevel.INFO)
    .logStackTrace(false)
    .build();
}

/**
 * Easily creates a "Forbidden" error (403). To throw when
 * the user is authenticated but doesn't have sufficient
 * rights to access the requested resource.
 */
export function createForbiddenError(
  logMessage: any = 'Forbidden',
  publicMessage = 'Access denied.',
) {
  return createError(globalConstants.errors.apiGeneralErrors.codes.FORBIDDEN, logMessage)
    .publicMessage(publicMessage)
    .httpStatus(HttpStatusCodes.FORBIDDEN)
    .logLevel(LogLevel.INFO)
    .logStackTrace(false)
    .build();
}
