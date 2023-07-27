/**
 * Configuration for the token transformation
 * middleware (UTTM).
 */
export interface ITokenTtransformationMiddlewareConfig {
  service: ITokenTtransformationMiddlewareServiceConfig;
  extensions: {
    jwt: {
      customDataProvider: ITokenTtransformationMiddlewareCustomDataProviderConfig;
    };
  };
}

/**
 * Configuration specific for the token transformation service.
 */
export interface ITokenTtransformationMiddlewareServiceConfig {
  uri: string;
}

/**
 * Configuration specific for the custom data provider.
 */
export interface ITokenTtransformationMiddlewareCustomDataProviderConfig {
  uri: string;
  method: string;
  options: any;
}
