import { ILogger } from '@villedemontreal/logger';
import * as os from 'os';
import * as path from 'path';
import { constants } from './constants';

/**
 * Lib configs
 */
export class Configs {
  public isWindows: boolean;
  public libRoot: string;
  /**
   * The host to query the public keys
   */
  private _host: string;
  /**
   * The endpoint to query the public keys
   */
  private _endpoint: string = constants.default.endpoint;
  /**
   * The parameters to query the public keys
   */
  private _fetchKeysParameters: string = constants.default.fetchKeysParameters;
  /**
   * Cache duration
   */
  private _cacheDuration: number = constants.default.cacheDuration;

  /**
   * When this library is used as a dependency in a project, the source project name will be the property name in the package.json of this project
   *
   * @private
   * @type {string}
   * @memberof Configs
   */
  private readonly _sourceProjectName: string;

  private _loggerCreator: (name: string) => ILogger;
  private _correlationIdProvider: () => string;

  constructor() {
    this.libRoot = path.normalize(__dirname + '/../../..');
    this.isWindows = os.platform() === 'win32';
    const sourcePackageJson = require(`${constants.appRoot}/package.json`);
    this._sourceProjectName = sourcePackageJson?.name ? sourcePackageJson.name : '';
  }

  /**
   * Get the host to query the public keys
   * @return {string} host
   */
  public getHost() {
    if (!this._host) {
      throw new Error(`The "host" must be set!`);
    }
    return this._host;
  }

  /**
   * Get the endpoint to query the public keys
   * @return {string} endpoint
   */
  public getEndpoint() {
    return this._endpoint;
  }

  /**
   * Get the parameters to query the public keys
   * @return {string} fetchKeysParameters
   */
  public getFetchKeysParameters() {
    return this._fetchKeysParameters;
  }

  /**
   * Get the cache duration in seconds
   * @return {number} cacheDuration
   */
  public getCacheDuration() {
    return this._cacheDuration;
  }

  /**
   * Set the host to query the public keys
   * @param {string} host
   * @return
   */
  public setHost(host: string) {
    this._host = host;
  }

  /**
   * Set the endpoint to query the public keys
   * @param {string} endpoint
   * @return
   */
  public setEndpoint(endpoint: string) {
    this._endpoint = endpoint;
  }

  /**
   * Set the paramters to query the public keys
   * @param {string} fetchKeysParameters
   * @return
   */
  public setFetchKeysParameters(fetchKeysParameters: string) {
    this._fetchKeysParameters = fetchKeysParameters;
  }

  /**
   * Get the cache duration in seconds
   * @param {number} cacheDuration
   * @return
   */
  public setCacheDuration(cacheDuration: number) {
    this._cacheDuration = cacheDuration;
  }

  /**
   * The Logger creator
   */
  get loggerCreator(): (name: string) => ILogger {
    if (!this._loggerCreator) {
      throw new Error(`The Logger Creator HAS to be set as a configuration`);
    }
    return this._loggerCreator;
  }

  /**
   * Sets the Logger creator.
   */
  public setLoggerCreator(loggerCreator: (name: string) => ILogger) {
    this._loggerCreator = loggerCreator;
  }

  /**
   * Sets the Correlation Id provider.
   */
  public setCorrelationIdProvider(correlationIdProvider: () => string) {
    this._correlationIdProvider = correlationIdProvider;
  }

  /**
   * Get the source project name where this library is imported
   *
   * @return {*}  {string}
   * @memberof Configs
   */
  public getSourceProjectName(): string {
    return this._sourceProjectName;
  }

  /**
   * The Correlation Id provider
   */
  get correlationIdProvider(): () => string {
    if (!this._correlationIdProvider) {
      throw new Error(
        `The Correlation Id provider HAS to be set as a configuration! Please call the init(...) fonction first.`
      );
    }
    return this._correlationIdProvider;
  }
}

export const configs = new Configs();
