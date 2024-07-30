import {
  AccountProfile,
  AnonymousUserIdentity,
  CitizenIdentity,
  EmployeeIdentity,
  ExternalUserIdentity,
  GenericUserIdentity,
  GuestUserIdentity,
  Identity,
  LegacyServiceAccountIdentity,
  ServiceAccountIdentity,
  UnknownIdentity,
} from '../models/identities';

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
 * console.log(`Order created by "${identity}"`); // Order created by "employee:udoejo3:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm"
 * @example
 * const identity = createIdentityFromJwt(req.jwt);
 * res.send({ message: `Welcome back ${identity.displayName}`}); // { message: "Welcome back John DOE" }
 * @example
 * const identity = createIdentityFromJwt(req.jwt);
 * if (identity.type === 'employee') {
 *    const employeeRecord = employeeAPI.findEmployee(identity.registrationNumber);
 * } else {
 *    throw new Error(`Expected an employee but received "${identity}"`);
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
    const username = getStringClaim(jwt, 'userName', type);
    const result: AnonymousUserIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type),
      username,
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'userName',
        internalId: sub,
      },
      toString(this: AnonymousUserIdentity) {
        return encodeComponents(this.type, this.id, this.displayName);
      },
    };
    return result;
  }
  //----------< Service account >-----------------------------------------
  if (userType === 'client') {
    const result: ServiceAccountIdentity = {
      type: 'service-account',
      id: aud, // Gluu clientID or Azure appId
      displayName: getStringClaim(jwt, 'displayName'),
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'aud',
        internalId: oid ?? sub,
      },
      toString(this: ServiceAccountIdentity) {
        return encodeComponents(this.type, this.id, this.displayName);
      },
    };
    return result;
  }
  //----------< Legacy Service account >-----------------------------------------
  if (userType === 'serviceAccount') {
    const type = 'legacy-service-account';
    const username = getStringClaim(jwt, 'userName', type);
    const result: LegacyServiceAccountIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type),
      username,
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'userName',
        internalId: sub,
      },
      toString(this: LegacyServiceAccountIdentity) {
        return encodeComponents(this.type, this.id, this.displayName);
      },
    };
    return result;
  }
  //----------< Citizen >-----------------------------------------
  if (userType === 'citizen') {
    const type = 'citizen';
    if (realm !== 'citizens') {
      throw new Error(`${type}: expected token to belong to the "citizens" realm`);
    }
    const result: CitizenIdentity = {
      type,
      id: getStringClaim(jwt, 'mtlIdentityId', type),
      displayName: getStringClaim(jwt, 'name', type),
      email: getStringClaim(jwt, 'email', type),
      firstName: getStringClaim(jwt, 'givenName', type),
      lastName: getStringClaim(jwt, 'familyName', type),
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'mtlIdentityId',
        internalId: oid ?? sub,
      },
      toString(this: CitizenIdentity) {
        return encodeComponents(this.type, this.id, this.displayName, this.email);
      },
    };
    return result;
  }
  //----------< Generic user >-----------------------------------------
  if (isGenericUser === true) {
    const type = 'generic-user';
    const username = getStringClaim(jwt, 'userName', type);
    const result: GenericUserIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type),
      username,
      department: getOptionalStringClaim(jwt, 'department'),
      firstName: getStringClaim(jwt, 'givenName', type),
      lastName: getStringClaim(jwt, 'familyName', type),
      accountProfile: getAccountProfile(jwt),
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'userName',
        internalId: oid ?? sub,
      },
      toString(this: GenericUserIdentity) {
        return encodeComponents(
          this.type,
          this.id,
          this.displayName,
          this.department,
          this.accountProfile
        );
      },
    };
    return result;
  }
  //----------< Employee >-----------------------------------------
  if (userType === 'employee' && isEmployee(jwt)) {
    const type = 'employee';
    if (realm !== 'employees') {
      throw new Error(`${type}: expected token to belong to the "employees" realm`);
    }
    const username = getStringClaim(jwt, 'userName', type);
    const result: EmployeeIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type),
      email: getStringClaim(jwt, 'email', type),
      username,
      registrationNumber: getStringClaim(jwt, 'employeeNumber', type),
      department: getStringClaim(jwt, 'department', type),
      firstName: getStringClaim(jwt, 'givenName', type),
      lastName: getStringClaim(jwt, 'familyName', type),
      accountProfile: getAccountProfile(jwt),
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'userName',
        internalId: oid ?? sub,
      },
      toString(this: EmployeeIdentity) {
        return encodeComponents(
          this.type,
          this.id,
          this.displayName,
          this.email,
          this.registrationNumber,
          this.department,
          this.accountProfile
        );
      },
    };
    return result;
  }
  //----------< External user >-----------------------------------------
  if (userType === 'employee' && isExternalUser(jwt)) {
    const type = 'external-user';
    if (realm !== 'employees') {
      throw new Error(`${type}: expected token to belong to the "employees" realm`);
    }
    const username = getStringClaim(jwt, 'userName', type);
    const result: ExternalUserIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type),
      email: getOptionalStringClaim(jwt, 'email'),
      username,
      department: getOptionalStringClaim(jwt, 'department'),
      firstName: getStringClaim(jwt, 'givenName', type),
      lastName: getStringClaim(jwt, 'familyName', type),
      accountProfile: getAccountProfile(jwt),
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'userName',
        internalId: oid ?? sub,
      },
      toString(this: ExternalUserIdentity) {
        return encodeComponents(
          this.type,
          this.id,
          this.displayName,
          this.email,
          this.department,
          this.accountProfile
        );
      },
    };
    return result;
  }
  //----------< Guest user >-----------------------------------------
  if (isGuestUser(jwt)) {
    const type = 'guest-user';
    const username = getStringClaim(jwt, 'userName', type);
    const result: GuestUserIdentity = {
      type,
      id: username,
      displayName: getStringClaim(jwt, 'name', type),
      email: getStringClaim(jwt, 'email'),
      username,
      source: {
        issuer,
        accessTokenIssuer,
        env,
        realm,
        claim: 'userName',
        internalId: oid ?? sub,
      },
      toString(this: GuestUserIdentity) {
        return encodeComponents(this.type, this.id, this.displayName, this.email);
      },
    };
    return result;
  }
  //----------< Unknown user type >-----------------------------------------
  const username = getOptionalStringClaim(jwt, 'userName');
  const result: UnknownIdentity = {
    type: 'unknown',
    id: username ?? sub,
    displayName: getOptionalStringClaim(jwt, 'name') ?? 'unknown',
    source: {
      issuer,
      accessTokenIssuer,
      env,
      realm,
      claim: username ? 'userName' : 'sub',
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

function getStringClaim(jwt: any, name: string, identityType?: string): string | undefined {
  const result = getOptionalStringClaim(jwt, name);
  if (!result) {
    const prefix = identityType ? `${identityType}: ` : '';
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
  const username = jwt.userName;
  if (typeof username !== 'string') {
    return false;
  }
  const employeeNumber = getOptionalStringClaim(jwt, 'employeeNumber');
  const department = getOptionalStringClaim(jwt, 'department');
  const isCodeU = username.toLocaleLowerCase().startsWith('u');
  const hasEmployeeNumber = !!employeeNumber;
  const hasDepartment = !!department;
  return isCodeU && hasEmployeeNumber && hasDepartment;
}

function isExternalUser(jwt: any): boolean {
  const username = jwt.userName;
  if (typeof username !== 'string') {
    return false;
  }
  const email = getOptionalStringClaim(jwt, 'email');
  const isCodeX = username.toLocaleLowerCase().startsWith('x');
  const isExtEmail = email && email.toLocaleLowerCase().includes('.ext@');
  return isCodeX || isExtEmail;
}

function isGuestUser(jwt: any): boolean {
  const username = jwt.userName;
  if (typeof username !== 'string') {
    return false;
  }
  return (
    username.endsWith('#EXT#@lavilledemontreal.omnicrosoft.com') ||
    username.endsWith('#EXT#@MontrealVille.onmicrosoft.com')
  );
}
