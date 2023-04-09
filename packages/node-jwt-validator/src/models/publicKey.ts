import * as crypto from 'crypto';

/**
 * The content of public key
 */
export interface IPublicKey {
  id: number;
  algorithm: string;
  publicKey: string;
  parsedPublicKey?: crypto.KeyObject;
  state: PublicKeyState;
  createdAt?: string;
  expiresAt?: string;
}

/**
 * List of public key with keyId as key
 */
export interface IPublicKeys {
  [keyId: number]: IPublicKey;
}

/**
 * Array of public key
 */
// tslint:disable-next-line:no-empty-interface
export type IPublicKeysList = Array<IPublicKey>;

/**
 * Public key state
 */
export enum PublicKeyState {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}
