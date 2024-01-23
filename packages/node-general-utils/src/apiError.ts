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

import * as _ from 'lodash';
import { LogLevel } from './logLevel';
import { utils } from './utils';

export { LogLevel };

/**
 * Represents the final object containing an error to return
 * as a response to a request.
 */
export interface IErrorResponse {
  /**
   * The error object.
   */
  error: IApiError;
}

/**
 * Error Reponse Type Guard
 */
export const isErrorResponse = (obj: any): obj is IErrorResponse => {
  return obj && utils.isObjectStrict(obj) && 'error' in obj && isApiError(obj.error);
};

/**
 * An error object.
 */
export interface IApiError {
  /**
   * One of a server-defined set of error codes.
   */
  code: string;

  /**
   * A human-readable representation of the error.
   */
  message: string;

  /**
   * The target of the error.
   */
  target?: string;

  /**
   * An array of details about specific errors that led to this reported error.
   */
  details?: IApiError[];

  /**
   * An object containing more specific information than the current object
   * about the error.
   */
  innererror?: IApiInnerError;
}

/**
 * Error Type Guard
 */
export const isApiError = (obj: any): obj is IApiError => {
  if (!obj || !utils.isObjectStrict(obj) || !('code' in obj) || !('message' in obj)) {
    return false;
  }

  // ==========================================
  // We make sure the object doesn't contain unknown
  // fields. Some third-party libraries such as
  // "mssql" will throw errors that do have a "code"
  // and "message" fields, but we don't want those errors
  // to be considered as IApiError!
  // ==========================================
  for (const key of Object.keys(obj)) {
    if (!_.includes(['code', 'message', 'target', 'details', 'innererror'], key)) {
      return false;
    }
  }

  return true;
};

/**
 * An object containing more specific information than the current
 * object about the error.
 */
export interface IApiInnerError {
  /**
   * A more specific error code than was provided by the containing error.
   */
  code?: string;

  /**
   * An object containing more specific information than the current object
   * about the error.
   */
  innererror?: IApiInnerError;

  /**
   * Any number of custom properties.
   */
  [name: string]: any;
}

/**
 * Represents an error and some extra informations
 * to use to manage it.
 */
export interface IApiErrorAndInfo {
  /**
   * The error to send.
   */
  error: IApiError;

  /**
   * The http status to use to send the error.
   */
  httpStatus: number;

  /**
   * The log message
   */
  logMessage: any;

  /**
   * The log level
   */
  logLevel?: LogLevel;

  /**
   * Log stackTrace?
   */
  logStackTrace?: boolean;
}

/**
 * IApiErrorAndInfo Type Guard
 */
export const isApiErrorAndInfo = (obj: any): obj is IApiErrorAndInfo => {
  return (
    obj &&
    utils.isObjectStrict(obj) &&
    'error' in obj &&
    isApiError(obj.error) &&
    'httpStatus' in obj &&
    'logMessage' in obj
  );
};

/**
 * Concrete error class to throw. It contains the actual error
 * to return and some extra info to help manage it.
 *
 * Since it extends the standard Node "Error" class, the stack trace will
 * be available.
 */
export class ApiErrorAndInfo extends Error implements IApiErrorAndInfo {
  constructor(
    public error: IApiError,
    public logMessage: any,
    public httpStatus: number,
    public logLevel: LogLevel,
    public logStackTrace: boolean,
  ) {
    super(
      ((): string => {
        if (!_.isObject(logMessage)) {
          return logMessage;
        }

        return (logMessage as any).msg || (logMessage as any).message || '';
      })(),
    );
  }
}
