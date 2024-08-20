import {
  AccountProfile,
  AnonymousIdentity,
  CitizenIdentity,
  EmployeeIdentity,
  ExternalUserIdentity,
  GenericUserIdentity,
  GuestUserIdentity,
  Identity,
  ServiceAccountIdentity,
  UnknownIdentity,
  UnknownUserIdentity,
  UserServiceAccountIdentity,
} from '../models/identities';

const usernameClaimName = 'userName';

/**
 * creates a specific type of Identity from the submitted JWT.
 * @param jwt specifies the JWT issued by TokenAPI
 * @returns a specific type of Identity
 * @description The purpose of this function is to classify the type of user behind the access token and select the right claim
 * for the unique ID of the account, as we need the most stable ID as possible.
 *
 * There is a displayName attribute when you need to display the identity in a GUI.
 *
 * Also, we provide a toString() function to format a verbose representation of the identity, used to audit as much information as possible.
 * @example
 * const identity = createIdentityFromJwt(req.jwt);
 * product.name = newName;
 * product.modifiedBy = identity.id; // udoejo3
 * @example
 * const identity = createIdentityFromJwt(req.jwt);
 * console.log(`Order created by "${identity}"`); // Order created by "user:employee:udoejo3:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm"
 * @example
 * const identity = createIdentityFromJwt(req.jwt);
 * res.send({ message: `Welcome back ${identity.displayName}`}); // { message: "Welcome back John DOE" }
 * @example
 * const identity = createIdentityFromJwt(req.jwt);
 * if (identity.type === 'user' && identity.attributes.type === 'employee') {
 *    const employeeRecord = await employeeAPI.findEmployee(identity.attributes.registrationNumber);
 * } else {
 *    throw new Error(`Expected an employee but received "${identity}"`);
 * }
 * @example
 * const identity = createIdentityFromJwt(req.jwt);
 * if (identity.type === 'user') {
 *   if (identity.attributes.email) {
 *      emailService.send(identity.attributes.email, 'Welcome', 'Bla bla...');
 *   } else {
 *      throw new Error(`User "${identity}" has no email`);
 *   }
 * }
 */
export function createIdentityFromJwt(jwt: any): Identity {
  if (jwt === null || jwt === undefined) {
    throw new Error('"jwt" parameter is required');
  }
  const issuer = getStringClaim(jwt, 'iss');
  const realm = getStringClaim(jwt, 'realm');
  const aud = getStringClaim(jwt, 'aud');
  const sub = getStringClaim(jwt, 'sub');
  const oid = getOptionalStringClaim(jwt, 'oid');
  const env = getOptionalStringClaim(jwt, 'env');
  const userType = getOptionalStringClaim(jwt, 'userType') ?? 'citizen';
  const accessTokenIssuer = getOptionalStringClaim(jwt, 'accessTokenIssuer');
  const isGenericUser = jwt.isGenericAccount;

  //----------< Anonymous user >-----------------------------------------
  if (userType === 'anonymous') {
    const type = 'anonymous';
    if (realm !== 'anonymous') {
      throw new Error(`${type}: expected token to belong to the "anonymous" realm`);
    }
    const username = getStringClaim(jwt, usernameClaimName, type);
    const result: AnonymousIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type),
      attributes: {
        type: 'anonymous',
        username,
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: usernameClaimName,
        internalId: sub,
      },
      toString(this: AnonymousIdentity) {
        return encodeComponents(this.type, this.id, this.displayName);
      },
    };
    return result;
  }
  //----------< Client Service account >-----------------------------------------
  if (userType === 'client') {
    const type = 'service-account';
    const subType = 'client';
    const result: ServiceAccountIdentity = {
      type,
      id: aud, // Gluu clientID or Azure appId
      displayName: getStringClaim(jwt, 'displayName', type, subType),
      attributes: {
        type: subType,
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'aud',
        internalId: oid ?? sub,
      },
      toString(this: ServiceAccountIdentity) {
        return encodeComponents(this.type, this.attributes.type, this.id, this.displayName);
      },
    };
    return result;
  }
  //----------< User Service account >-----------------------------------------
  if (userType === 'serviceAccount') {
    const type = 'service-account';
    const subType = 'user';
    const username = getStringClaim(jwt, usernameClaimName, type, subType);
    const result: UserServiceAccountIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type, subType),
      attributes: {
        type: subType,
        username,
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: usernameClaimName,
        internalId: sub,
      },
      toString(this: UserServiceAccountIdentity) {
        return encodeComponents(this.type, this.attributes.type, this.id, this.displayName);
      },
    };
    return result;
  }
  //----------< Citizen >-----------------------------------------
  if (userType === 'citizen') {
    const type = 'user';
    const subType = 'citizen';
    if (realm !== 'citizens') {
      throw new Error(`${type}:${subType}: expected token to belong to the "citizens" realm`);
    }
    const result: CitizenIdentity = {
      type,
      id: getStringClaim(jwt, 'mtlIdentityId', type, subType),
      displayName: getStringClaim(jwt, 'name', type, subType),
      attributes: {
        type: subType,
        username: getStringClaim(jwt, usernameClaimName, type, subType),
        email: getStringClaim(jwt, 'email', type, subType),
        firstName: getStringClaim(jwt, 'givenName', type, subType),
        lastName: getStringClaim(jwt, 'familyName', type, subType),
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'mtlIdentityId',
        internalId: oid ?? sub,
      },
      toString(this: CitizenIdentity) {
        return encodeComponents(
          this.type,
          this.attributes.type,
          this.id,
          this.displayName,
          this.attributes.email
        );
      },
    };
    return result;
  }
  //----------< Generic user >-----------------------------------------
  if (isGenericUser === true) {
    const type = 'user';
    const subType = 'generic-user';
    const username = getStringClaim(jwt, usernameClaimName, type, subType);
    const result: GenericUserIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type, subType),
      attributes: {
        type: 'generic',
        username,
        email: getOptionalStringClaim(jwt, 'email'),
        department: getOptionalStringClaim(jwt, 'department'),
        firstName: getStringClaim(jwt, 'givenName', type, subType),
        lastName: getStringClaim(jwt, 'familyName', type, subType),
        accountProfile: getAccountProfile(jwt),
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: usernameClaimName,
        internalId: oid ?? sub,
      },
      toString(this: GenericUserIdentity) {
        return encodeComponents(
          this.type,
          this.attributes.type,
          this.id,
          this.displayName,
          this.attributes.email,
          this.attributes.department,
          this.attributes.accountProfile
        );
      },
    };
    return result;
  }
  //----------< Employee >-----------------------------------------
  if (userType === 'employee' && isEmployee(jwt)) {
    const type = 'user';
    const subType = 'employee';
    if (realm !== 'employees') {
      throw new Error(`${type}:${subType}: expected token to belong to the "employees" realm`);
    }
    const username = getStringClaim(jwt, usernameClaimName, type, subType);
    const result: EmployeeIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type, subType),
      attributes: {
        type: subType,
        email: getStringClaim(jwt, 'email', type, subType),
        username,
        registrationNumber: getStringClaim(jwt, 'employeeNumber', type, subType),
        department: getStringClaim(jwt, 'department', type, subType),
        firstName: getStringClaim(jwt, 'givenName', type, subType),
        lastName: getStringClaim(jwt, 'familyName', type, subType),
        accountProfile: getAccountProfile(jwt),
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: usernameClaimName,
        internalId: oid ?? sub,
      },
      toString(this: EmployeeIdentity) {
        return encodeComponents(
          this.type,
          this.attributes.type,
          this.id,
          this.displayName,
          this.attributes.email,
          this.attributes.registrationNumber,
          this.attributes.department,
          this.attributes.accountProfile
        );
      },
    };
    return result;
  }
  //----------< External user >-----------------------------------------
  if (userType === 'employee' && isExternalUser(jwt)) {
    const type = 'user';
    const subType = 'external';
    if (realm !== 'employees') {
      throw new Error(`${type}:${subType}: expected token to belong to the "employees" realm`);
    }
    const username = getStringClaim(jwt, usernameClaimName, type, subType);
    const result: ExternalUserIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type, subType),
      attributes: {
        type: subType,
        email: getOptionalStringClaim(jwt, 'email'),
        username,
        department: getOptionalStringClaim(jwt, 'department'),
        firstName: getStringClaim(jwt, 'givenName', type, subType),
        lastName: getStringClaim(jwt, 'familyName', type, subType),
        accountProfile: getAccountProfile(jwt),
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: usernameClaimName,
        internalId: oid ?? sub,
      },
      toString(this: ExternalUserIdentity) {
        return encodeComponents(
          this.type,
          this.attributes.type,
          this.id,
          this.displayName,
          this.attributes.email,
          this.attributes.department,
          this.attributes.accountProfile
        );
      },
    };
    return result;
  }
  //----------< Guest user >-----------------------------------------
  if (isGuestUser(jwt)) {
    const type = 'user';
    const subType = 'guest-user';
    const username = getStringClaim(jwt, usernameClaimName, type, subType);
    const result: GuestUserIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type, subType),
      attributes: {
        type: 'guest',
        email: getStringClaim(jwt, 'email', type, subType),
        username,
        department: getOptionalStringClaim(jwt, 'department'),
        firstName: getOptionalStringClaim(jwt, 'givenName'),
        lastName: getOptionalStringClaim(jwt, 'familyName'),
        accountProfile: getAccountProfile(jwt),
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: usernameClaimName,
        internalId: oid ?? sub,
      },
      toString(this: GuestUserIdentity) {
        return encodeComponents(
          this.type,
          this.attributes.type,
          realm,
          this.id,
          this.displayName,
          this.attributes.email
        );
      },
    };
    return result;
  }
  //----------< Unknown user type >-----------------------------------------
  const username = getOptionalStringClaim(jwt, usernameClaimName);
  const email = getOptionalStringClaim(jwt, 'email');
  if (username || email) {
    const type = 'user';
    const subType = 'unknown';
    const claim = username ? usernameClaimName : 'email';
    const result: UnknownUserIdentity = {
      type,
      id: getStringClaim(jwt, claim, type, subType),
      displayName: getOptionalStringClaim(jwt, 'name') ?? email ?? username,
      attributes: {
        type: subType,
        email: getOptionalStringClaim(jwt, 'email'),
        username,
        department: getOptionalStringClaim(jwt, 'department'),
        firstName: getOptionalStringClaim(jwt, 'givenName'),
        lastName: getOptionalStringClaim(jwt, 'familyName'),
        accountProfile: getAccountProfile(jwt),
      },
      source: {
        aud,
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: claim,
        internalId: oid ?? sub,
      },
      toString(this: UnknownUserIdentity) {
        return encodeComponents(
          this.type,
          this.attributes.type,
          this.id,
          this.displayName,
          this.attributes.email,
          this.attributes.department,
          this.attributes.accountProfile
        );
      },
    };
    return result;
  }
  //----------< Unknown identity type >-----------------------------------------
  const result: UnknownIdentity = {
    type: 'unknown',
    id: sub,
    displayName: getOptionalStringClaim(jwt, 'name') ?? 'unknown',
    attributes: {
      type: 'unknown',
    },
    source: {
      aud,
      issuer,
      accessTokenIssuer,
      env,
      realm,
      claim: username ? usernameClaimName : 'sub',
      internalId: oid ?? sub,
    },
    toString(this: UnknownIdentity) {
      return encodeComponents(this.type, this.id, this.displayName);
    },
  };
  return result;
}

function getOptionalStringClaim(jwt: any, name: string): string | undefined {
  const result = jwt[name];
  if (result === undefined || result === null) {
    return undefined;
  }
  if (typeof result !== 'string') {
    throw new Error(`Expected claim '${name}' to contain a string but received: ${result}`);
  }
  return result;
}

function getStringClaim(
  jwt: any,
  name: string,
  identityType?: string,
  identitySubType?: string
): string | undefined {
  const result = getOptionalStringClaim(jwt, name);
  if (!result) {
    const subType = identitySubType ? `${identitySubType}: ` : '';
    const prefix = (identityType ? `${identityType}: ` : '') + subType;
    throw new Error(`${prefix}expected to find the "${name}" claim in the JWT`);
  }
  return result;
}

function encodeComponents(...components: string[]): string {
  return components.map((x) => (x ?? '').replace(':', '_')).join(':');
}

function getAccountProfile(jwt: any): AccountProfile {
  const email = getOptionalStringClaim(jwt, 'email');
  if (email) {
    if (email.endsWith('@spvm.qc.ca')) {
      return 'spvm';
    }
    if (email.endsWith('.adm@lavilledemontreal.omnicrosoft.com')) {
      return 'vdm-admin';
    }
    if (email.toLocaleLowerCase().endsWith('.adm@montrealville.omnicrosoft.com')) {
      return 'vdm-admin';
    }
  }
  return 'vdm';
}

function isEmployee(jwt: any): boolean {
  const username = getOptionalStringClaim(jwt, usernameClaimName);
  if (!username) {
    return false;
  }
  const employeeNumber = getOptionalStringClaim(jwt, 'employeeNumber');
  const department = getOptionalStringClaim(jwt, 'department');
  const name = getOptionalStringClaim(jwt, 'name');
  const firstName = getOptionalStringClaim(jwt, 'givenName');
  const lastName = getOptionalStringClaim(jwt, 'familyName');
  const isCodeU = username.toLocaleLowerCase().startsWith('u');
  const hasEmployeeNumber = !!employeeNumber;
  const hasDepartment = !!department;
  const hasNames = !!name && !!firstName && !!lastName;
  return isCodeU && hasEmployeeNumber && hasDepartment && hasNames;
}

function isExternalUser(jwt: any): boolean {
  const username = getOptionalStringClaim(jwt, usernameClaimName);
  if (!username) {
    return false;
  }
  const name = getOptionalStringClaim(jwt, 'name');
  const firstName = getOptionalStringClaim(jwt, 'givenName');
  const lastName = getOptionalStringClaim(jwt, 'familyName');
  const hasNames = !!name && !!firstName && !!lastName;
  if (!hasNames) {
    return false;
  }
  const email = getOptionalStringClaim(jwt, 'email');
  const isCodeX = username.toLocaleLowerCase().startsWith('x');
  const isExtEmail = email && email.toLocaleLowerCase().includes('.ext@');
  return isCodeX || isExtEmail;
}

function isGuestUser(jwt: any): boolean {
  const username = getOptionalStringClaim(jwt, usernameClaimName);
  if (!username) {
    return false;
  }
  const email = getOptionalStringClaim(jwt, 'email');
  if (!email) {
    return false;
  }
  const name = getOptionalStringClaim(jwt, 'name');
  if (!name) {
    return false;
  }
  return (
    username.endsWith('#EXT#@lavilledemontreal.omnicrosoft.com') ||
    username.endsWith('#EXT#@MontrealVille.onmicrosoft.com')
  );
}
