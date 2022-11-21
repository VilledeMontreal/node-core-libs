import { init as initHttpUtils } from '@villedemontreal/http-request';
import { ILogger } from '@villedemontreal/logger';
import { configs } from './configs';
import { constants } from './constants';

let libIsInited = false;

/**
 * Inits the library.
 */
export function init(
  loggerCreator: (name: string) => ILogger,
  correlationIdProvider: () => string,
  host: string,
  endpoint: string = constants.default.endpoint,
  fetchKeysParameters: string = constants.default.fetchKeysParameters,
  cacheDuration: number = constants.default.cacheDuration,
  urlCaseSensitive = false
): void {
  if (!loggerCreator) {
    throw new Error(`The Logger Creator is required.`);
  }
  configs.setLoggerCreator(loggerCreator);

  if (!correlationIdProvider) {
    throw new Error(`The Correlation Id provider is required.`);
  }
  configs.setCorrelationIdProvider(correlationIdProvider);

  configs.setHost(host);
  configs.setEndpoint(endpoint);
  configs.setFetchKeysParameters(fetchKeysParameters);
  configs.setCacheDuration(cacheDuration);

  // ==========================================
  // Inits the Http Utils library!
  // ==========================================
  initHttpUtils(loggerCreator, correlationIdProvider, urlCaseSensitive);

  // ==========================================
  // Set as being "properly initialized".
  // At the very end of the "init()" function!
  // ==========================================
  libIsInited = true;
}

/**
 * Is the library properly initialized?
 *
 * This function MUST be named "isInited()"!
 * Code using this library may loop over all its "@villedemontreal"
 * dependencies and, if one of those exports a "isInited" fonction,
 * it will enforce that the lib has been properly initialized before
 * starting...
 */
export function isInited(): boolean {
  return libIsInited;
}
