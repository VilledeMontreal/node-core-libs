/**
 * An input access token
 */
export interface IInputAccessTokenExtensionsJwtCustomDataProvider {
  uri: string;
  method?: string;
  options?: any;
  name?: string;
  useJwtInAuthHeader?: boolean;
}
export interface IInputAccessTokenExtensionsJwt {
  customDataProvider: IInputAccessTokenExtensionsJwtCustomDataProvider;
}

export interface IInputAccessTokenExtensions {
  jwt: IInputAccessTokenExtensionsJwt;
}

export interface IInputAccessTokenSource {
  url: string;
  method: string;
  serviceName: string;
  basicJwtCacheKey?: string; // the name of the cache key for the basic JWT, to use the same key as the Kong plugin
  extendedJwtCacheKey?: string; // the name of the cache key for the extended JWT, to use the same key as the Kong plugin
  extendedJwtConfigDigest?: string; // the digest that should be included in the extended JWT, to verify later that we retrieved a cached JWT matching the right config.
  clientIp: string;
}

export interface IInputAccessToken {
  accessToken: string;
  accessTokenIssuer?: string;
  source?: IInputAccessTokenSource;
  jwt?: string;
  extensions?: IInputAccessTokenExtensions;
}
