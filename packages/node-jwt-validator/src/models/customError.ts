import { createError, IApiError, IApiErrorAndInfo } from '@villedemontreal/general-utils';
import { LogLevel } from '@villedemontreal/logger';
import * as HttpStatusCodes from 'http-status-codes';
import { constants } from '../config/constants';

/**
 * Easily creates an "InvalidJWT" error (401). To throw when
 * the user has a bad/expired JWT
 */
export function createInvalidJwtError(detail: IApiError): IApiErrorAndInfo {
  return createError(constants.errors.codes.INVALID_JWT, 'Invalid JWT')
    .httpStatus(HttpStatusCodes.UNAUTHORIZED)
    .target('Authorization header')
    .publicMessage('Invalid JWT')
    .logLevel(LogLevel.ERROR)
    .logStackTrace(false)
    .addDetail(detail)
    .build();
}

/**
 * Easily creates an "invalidAuthHedaer" error (401). To throw when
 * the user has a bad authorization header
 */
export function createInvalidAuthHeaderError(detail: IApiError): IApiErrorAndInfo {
  return createError(
    constants.errors.codes.INVALID_AUTHORIZATION_HEADER,
    'Invalid Authorization header'
  )
    .httpStatus(HttpStatusCodes.UNAUTHORIZED)
    .target('Authorization header')
    .publicMessage('Invalid Authorization header')
    .logLevel(LogLevel.ERROR)
    .logStackTrace(false)
    .addDetail(detail)
    .build();
}
