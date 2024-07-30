/**
 * Contains some common attributes that provide some traceability for understanding which claim we have selected for the ID of the identity,
 * where does the token come from and which was the internal ID of the user in the IDP.
 */
export interface IdentitySource {
  /**
   * Which service issued the JWT that we parsed into an identity.
   * Usually, this would be 'security-identity-token-api'.
   */
  issuer: string;
  /**
   * Which IDP produced the access token that was submitted to TokenAPI.
   * For EntraID, this would be https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0,
   * for Azure AD B2C https://connexion.montreal.ca,
   * for Gluu employee https://idp.montreal.ca,
   * for Gluu citizens https://auth.montreal.ca,
   * for anonymous tokens security-identity-anonymous-token-api
   */
  accessTokenIssuer?: string;
  /**
   * Which claim was used for the unique ID of the identity.
   * This could be: userName, email, mtlIdentityId, aud, sub
   */
  claim: string;
  /**
   * The internal ID that would provide access to the user object in the IDP itself.
   * For Azure, this would be the 'oid' (or objectID) and for Gluu this would be the inum (or sub).
   */
  internalId: string;
  /**
   * The realm that produced the access token.
   * This could be: employees, citizens, anonymous
   */
  realm: string;
  /**
   * The name of the environment that produced the JWT.
   * This could be:  lab, dev, accept, prod
   */
  env?: string;
}

/**
 * A BaseIdentity contains attributes shared by all types of Identity.
 */
export interface BaseIdentity {
  /**
   * A stable unique ID for the authenticated user.
   * An ID can be mapped to a username, email, appId according to the type of user.
   * The name of the selected attribute will be specified in the source object, in the 'claim' attribute.
   */
  id: string;
  /**
   * A display name for the authenticated user
   */
  displayName: string;
  /**
   * The information about the source of the JWT and its associated access token.
   * It would also specify which claim has been selected for the unique ID of the identity.
   */
  source: IdentitySource;
  /**
   * A helper function for formatting the Identity in order to log it or audit it.
   * This is for diagnostics only.
   */
  toString(): string;
}

/**
 * The type of profile selected by the user at login time, when a user has multiple identities
 * such as a VDM employee with a SPVM email.
 * 'vdm-admin' whould be selected when the authenticated user is a sysadmin who selected his superadmin profile,
 * instead of the regular one.
 */
export type AccountProfile = 'vdm' | 'vdm-admin' | 'spvm';

/**
 * This is an employee, on the payroll of the city of Montreal.
 *
 * The id is mapped to the username.
 */
export interface EmployeeIdentity extends BaseIdentity {
  /** The type of identity
   */
  type: 'employee';
  /**
   * The email of the employee.
   * There are multiple domains such as montreal.ca or spvm.qc.ca
   */
  email: string;
  /**
   * The username of the employee which should be a short code starting with the letter 'u'.
   * For instance: uzartw1
   */
  username: string;
  /**
   * The registration number of the employee as part of the HR process.
   * For instance: 100375065
   */
  registrationNumber: string;
  /**
   * The department of the employee.
   * For instance: 421408000000
   */
  department: string;
  /**
   * The first name of the employee.
   * For instance: John
   */
  firstName: string;
  /**
   * The last name of the employee.
   * For instance: DOE
   */
  lastName: string;
  /**
   * The account profile that was selected upon logon.
   */
  accountProfile: AccountProfile;
}

/**
 * This is an external user: an external collaborator or consultant that is not on the payroll of the city of Montreal.
 *
 * The id is mapped to the username.
 */
export interface ExternalUserIdentity extends BaseIdentity {
  /**
   * The type of identity
   */
  type: 'external-user';
  /**
   * The email of the external user.
   * The name part of the email should end with ".ext", like john.doe.ext@montreal.ca
   */
  email?: string; // TODO: validate if this is really optional
  /**
   * The username of the external user which should be a short code starting with the letter 'x'.
   * For instance: xzartw1
   */
  username: string;
  /**
   * The department of the user. This is optional at the moment.
   * For instance: 421408000000
   */
  department?: string;
  /**
   * The first name of the user.
   * For instance: John
   */
  firstName: string;
  /**
   * The last name of the user.
   * For instance: DOE
   */
  lastName: string;
  /**
   * The account profile that was selected upon logon.
   */
  accountProfile: AccountProfile;
}

/**
 * This is a generic user: a user shared by employees or external users in order to perform QA tests in a non production environment.
 * Each generic user would have its own role or profile in the tested application, allowing one to perform the tasks required by the test.
 *
 * The id is mapped to the username.
 */
export interface GenericUserIdentity extends BaseIdentity {
  /**
   * The type of identity
   */
  type: 'generic-user';
  /**
   * The username of the user which should be a short code starting with the letters 'cg'.
   * For instance: cgdsecdev2
   */
  username: string;
  /**
   * The department of the user. This is optional at the moment.
   * For instance: 421408000000
   */
  department?: string;
  /**
   * The first name of the user.
   * For instance: John
   */
  firstName: string;
  /**
   * The last name of the user.
   * For instance: DOE
   */
  lastName: string;
  /**
   * The account profile that was selected upon logon.
   */
  accountProfile: AccountProfile;
}

/**
 * This is a guest user: a user who doesn't work for the city of Montreal but needs to colloborate with a set of limited and specific services.
 * Note that, in theory, we could have guest users in other realms such as citizens (like sysadmins), but they cannot login at the moment and thus
 * we should only have tokens from the 'employees' realm.
 * Note that this kind of user might not have a firstName and lastName.
 *
 * The id is mapped to the username.
 */
export interface GuestUserIdentity extends BaseIdentity {
  /**
   * The type of identity
   */
  type: 'guest-user';
  /**
   * The username of the guest user which should contain the '#EXT#' suffix and belong to the "lavilledemontreal.onmicrosoft.com" domain.
   * For instance: john.doe_hydro.qc.ca#EXT#@lavilledemontreal.onmicrosoft.com
   */
  username: string;
  /**
   * The email of the guest user.
   * The domain of the email should not belong to the City of Montreal, such as montreal.ca or spvm.qc.ca.
   * For instance: john.doe@hydro.qc.ca
   */
  email: string;
}

/**
 * This is a citizen: a user consuming Montreal digital services.
 * There are regular citizen accounts for families as well as citizens acting on behalf of their organization.
 *
 * The ID of the citizen is managed by the DCI (Dossier Citoyen Intégré) and is known as mtlIdentityId.
 */
export interface CitizenIdentity extends BaseIdentity {
  /**
   * The type of identity
   */
  type: 'citizen';
  /**
   * The email of the citizen.
   * This is his own mail used for registering to Montreal digital services.
   */
  email: string;
  /**
   * The first name of the citizen.
   * For instance: John
   */
  firstName: string;
  /**
   * The last name of the citizen.
   * For instance: DOE
   */
  lastName: string;
}

/**
 * This is an anonymous user: a user consuming some basic digitital services that don't require to be identified,
 * such as reporting a pot hole in the street.
 *
 * The id is mapped to the username.
 */
export interface AnonymousUserIdentity extends BaseIdentity {
  /** The type of identity */
  type: 'anonymous';
  /**
   * The username of the anonymous user.
   * For instance: srvAccAnonymous
   */
  username: string;
}

/**
 * This is the old way of managing service accounts, with a real user provisioned (that's why there is a username property).
 * This kind of account as been deprecated (hence the legacy part) in favor of real service accounts that don't allow interactive logon.
 *
 * The id is mapped to the username.
 */
export interface LegacyServiceAccountIdentity extends BaseIdentity {
  /** The type of identity */
  type: 'legacy-service-account';
  /**
   * The username of the legacy service account.
   * For instance: SrvAccDiagCanary
   */
  username: string;
}

/**
 * This is a service account, without interactive logon, that allows a backend service or an automation to perform some tasks
 * with the required privileges (least privilege).
 * A service account has an ID, a display name and a secret (that expires after a few months).
 *
 * The id is mapped to the appId in Azure or the inum in Gluu.
 */
export interface ServiceAccountIdentity extends BaseIdentity {
  /**
   * The type of identity
   */
  type: 'service-account';
}

/**
 * This is the default identity when we could not match the proper one from the submitted JWT.
 * This might happen when we introduce a new type and this lib has not been updated in the client application.
 *
 * The id is mapped to the username or the sub when the former is not available.
 */
export interface UnknownIdentity extends BaseIdentity {
  /**
   * The type of identity
   */
  type: 'unknown';
}

/**
 * This is the Identity of the user performing a request.
 * You would have to discriminate the right identity based on the 'type' property.
 * All identities would have a unique ID, a display name, a source and a toString() function for formatting the values.
 */
export type Identity =
  | AnonymousUserIdentity
  | CitizenIdentity
  | EmployeeIdentity
  | ExternalUserIdentity
  | GenericUserIdentity
  | GuestUserIdentity
  | LegacyServiceAccountIdentity
  | ServiceAccountIdentity
  | UnknownIdentity;
