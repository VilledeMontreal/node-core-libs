/* 
Type summary:

  Identity
    |_ UnknownIdentity <-> UnknownAttributes
    |
    |_ AnonymousIdentity <-> AnonymousAttributes
    |
    |_ ServiceAccountIdentity <-> ServiceAccountAttributes
    |     |_ ClientServiceAccountIdentity <-> ClientServiceAccountAttributes
    |     |_ UserServiceAccountIdentity <-> UserServiceAccountAttributes
    |
    |_ UserIdentity <-> UserAttributes
          |_ CitizenIdentity      <-> CitizenAttributes
          |_ EmployeeIdentity     <-> EmployeeAttributes
          |_ ExternalUserIdentity <-> ExternalUserAttributes
          |_ GenericUserIdentity  <-> GenericUserAttributes
          |_ GuestUserIdentity    <-> GuestUserAttributes
          |_ UnknownUserIdentity  <-> UnknownUserAttributes

Existing ID mappings:

| ---------------------------- | -------------------- | -------------------------------------------------------------- |
| Entity                       | ID                   | Example                                                        |
| ---------------------------- | -------------------- | -------------------------------------------------------------- |
| UnknownIdentity              | sub                  | foo1234                                                        |
| AnonymousIdentity            | username             | srvAccAnonymous                                                |
| UserServiceAccountAttributes | username             | srvAccDiagCanary                                               |
| ClientServiceAccountIdentity | aud (appId/clientId) | e5dd632b-cb97-48d7-a310-cde5147be717                           |
| CitizenIdentity              | mtlIdentityId        | @!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D  |
| EmployeeIdentity             | username             | umartw8                                                        |
| ExternalUserIdentity         | username             | xdoejo3                                                        |
| GenericUserIdentity          | username             | cgdsecdev2                                                     |
| GuestUserIdentity            | username             | doe.daniel_hydro.qc.ca#EXT#@lavilledemontreal.omnicrosoft.com  |
| ---------------------------- | -------------------- | -------------------------------------------------------------- |

Identity.toString() examples:

| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Identity                     | Example                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| UnknownIdentity              | unknown:12345:John Doe                                                                                                 |
| AnonymousIdentity            | anonymous:srvAccAnonymous:srvAcc Anonymous                                                                             |
| UserServiceAccountAttributes | service-account:user:srvAccDiagCanary:srvAcc Diagnostics Canary                                                        |
| ClientServiceAccountIdentity | service-account:client:e5dd632b-cb97-48d7-a310-cde5147be717:infra-auth-auth-playground-dev                             |
| CitizenIdentity              | user:citizen:@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D:John Doe:john.doe@mailinator.com            |
| EmployeeIdentity             | user:employee:udoejo3:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm                                         |
| ExternalUserIdentity         | user:external:xdoejo3:John DOE:john.doe@montreal.ca::vdm                                                               |
| GenericUserIdentity          | user:generic:cgdsecdev2:C.Generique dsec developpeur2::4211:vdm                                                        |
| GuestUserIdentity            | user:guest:doe.daniel_hydro.qc.ca#EXT#@lavilledemontreal.omnicrosoft.com:doe.daniel@hydro.qc.ca:doe.daniel@hydro.qc.ca |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |


*/

/************************************************************************************************
 * User attributes
 * ---------------
 * All user attributes extend the CommonUserAttributes type, which defines a couple of common but optional attributes.
 * All user attributes have at least a username or an email to qualify.
 *
 * We have identified the following types of user:
 *   - CitizenAttributes
 *   - EmployeeAttributes
 *   - ExternalUserAttributes
 *   - GenericUserAttributes
 *   - GuestUserAttributes
 *
 * If the subtype of user is not recognized, it will default to UnknownUserAttributes.
 *
 * The UserAttributes type is a union of all those types. It provides access to the
 * common optional attributes through the CommonUserAttributes type,
 * but it is better to test the 'type' of the attributes to access the strongly types attributes
 * with additional guarantees.
 *
 * Since some users might have multiple profiles and thus multiple emails (like @montreal.ca, .adm@montreal.ca or @spvm.qc.ca)
 * that they can select at login time, you might want to consider the "accountProfile" attribute which categorizes them.
 * The ID will correctly identify the physical person but not the selected role.
 * So, you could combine ID+accountProfile or prefer the email in some cases, like when you need to evaluate the permissions.
 *
 ************************************************************************************************/

/**
 * The type of profile selected by the user at login time, when a user has multiple identities
 * such as a VDM employee with a SPVM email.
 * 'vdm-admin' whould be selected when the authenticated user is a sysadmin who selected his superadmin profile,
 * instead of the regular one.
 * Usually defaults to 'vdm'.
 */
export type AccountProfile = 'vdm' | 'vdm-admin' | 'spvm';

/**
 * Common attributes optionally shared by all types of users.
 * You should test the 'type' attribute in order to strongly type the allowed attributes.
 */
export type CommonUserAttributes = {
  /**
   * The type of user that will specify which attributes are allowed.
   */
  type: string;
  /**
   * The username of the user, which could be an email, a UPN or a short code depending on the 'type'.
   */
  username: string;
  /**
   * The email of the user.
   */
  email?: string;
  /**
   * The first name of the user.
   */
  firstName?: string;
  /**
   * The last name of the user.
   */
  lastName?: string;
  /**
   * The department of the user.
   */
  department?: string;
  /**
   * The account profile that was selected upon logon.
   */
  accountProfile?: AccountProfile;
};

/**
 * The attributes of a citizen: a user consuming Montreal digital services.
 * There are regular citizen accounts for families as well as citizens acting on behalf of their organization.
 *
 * The ID of the citizen is managed by the DCI (Dossier Citoyen Intégré) and is known as mtlIdentityId.
 */
export type CitizenAttributes = CommonUserAttributes & {
  /**
   * The type of user that will specify which attributes are allowed.
   */
  type: 'citizen';
  /**
   * The username of the citizen which should be the email.
   */
  username: string;
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
};

/**
 * The attributes of an employee: a user on the payroll of the city of Montreal.
 *
 * The ID is mapped to the username.
 */
export type EmployeeAttributes = CommonUserAttributes & {
  /**
   * The type of user that will specify which attributes are allowed.
   */
  type: 'employee';
  /**
   * The username of the employee which should be a short code starting with the letter 'u'.
   * For instance: uzartw1
   */
  username: string;
  /**
   * The email of the employee.
   * There are multiple domains such as montreal.ca or spvm.qc.ca
   */
  email: string;
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
   * The account profile that was selected upon logon.
   */
  accountProfile: AccountProfile;
};

/**
 * The attributes of an external user: a user that is not on the payroll of the city of Montreal but actively collaborates 
 * with the city and has his own internal email and short code (starting with the letter x).

* The ID is mapped to the username.
 */
export type ExternalUserAttributes = CommonUserAttributes & {
  type: 'external';
  /**
   * The username of the external user which should be a short code starting with the letter 'x'.
   * For instance: xzartw1
   */
  username: string;
  /**
   * The email of the external user.
   * The name part of the email should end with ".ext", like john.doe.ext@montreal.ca
   */
  email?: string;
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
};

/**
 * The attributes of a generic user: a fake user used for testing only, that has the right profile or role to perform specific tasks.

* The ID is mapped to the username.
 */
export type GenericUserAttributes = CommonUserAttributes & {
  type: 'generic';
  /**
   * The username of the user which should be a short code starting with the letters 'cg'.
   * For instance: cgdsecdev2
   */
  username: string;
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
};

/**
 * The attributes of a guest: a user who is invited in the city of Montreal tenant in order to collaborate with some specific services.

* The ID is mapped to the username.
 */
export type GuestUserAttributes = CommonUserAttributes & {
  type: 'guest';
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
};

/**
 * An unknown user has no guaranteed attributes and defaults to optional common user attributes.
 * However, since it is a user, we know that it has at least a username or an email.
 *
 * The ID is mapped to the username or the email.
 */
export type UnknownUserAttributes = CommonUserAttributes & {
  type: 'unknown';
};

/**
 * The different sets of user attributes based on the user subtype.
 */
export type UserAttributes =
  | CitizenAttributes
  | EmployeeAttributes
  | ExternalUserAttributes
  | GenericUserAttributes
  | GuestUserAttributes
  | UnknownUserAttributes;

/************************************************************************************************
 * Anonymous attributes
 * --------------------
 * There is a single type of attributes for the anonymous identity.
 *
 ************************************************************************************************/

/**
 * The specific attributes for an anonymous identity.
 */
export type AnonymousAttributes = {
  type: 'anonymous';
  /**
   * The username of the anonymous user.
   * For instance: srvAccAnonymous
   */
  username: string;
};

/************************************************************************************************
 * Service account attributes
 * --------------------------
 * There are 2 types of service accounts:
 *   - client: this is a non-interactive client that used the OAuth2 client_credentials flow.
 *     This is the only flow for Azure AD B2C and Entra ID.
 *   - user: this is a specific user that used the OAuth2 password flow.
 *     This flow is deprecated.
 *
 ************************************************************************************************/

/**
 * The specific attributes for a service account of subtype 'client'.
 * Note that 'client' means that the service authenticated using the OAuth2 client_credentials flow.
 */
export type ClientServiceAccountAttributes = {
  type: 'client';
};

/**
 * The specific attributes for a service account of subtype 'user'.
 * Note that 'user' means that the service authenticated using the OAuth2 password flow. (Deprecated)
 */
export type UserServiceAccountAttributes = {
  type: 'user';
  /**
   * The username of the user service account.
   * For instance: SrvAccDiagCanary
   */
  username: string;
};

/**
 * The different sets of service account attributes based on the account subtype.
 */
export type ServiceAccountAttributes =
  | ClientServiceAccountAttributes
  | UserServiceAccountAttributes;

/***********************************************************************************************************************
 * Identities:
 * -----------
 * Each type of identity has some required properties, such as:
 *   - the ID
 *   - the display name
 *   - the source of this identity
 *   - the attributes specific to the subtype of identity
 *   - a toString() helper method that can format the identity for auditing or logging
 *
 * We have 3 types of identity:
 *   - user (employee, citizen, external user, generic user, guest user, unknown user...)
 *   - service account (client, user)
 *   - anonymous
 *
 * If we don't recognize one of those types of identity, we will default to UnknownIdentity.
 *
 * You'll have to test the type of identity before accessing the attributes, then you'll have to test the type of attributes.
 *
 * Note that a UserIdentity will default to the CommonUserAttributes type for its attributes, in order to provide
 * a quick access to some common user attributes. But those attributes will be optional and should be checked,
 * whereas the typed attributes will provide strong guarantees.
 *
 ***********************************************************************************************************************/

/**
 * Contains some common attributes that provide some traceability for understanding which claim we have selected for the ID of the identity,
 * where does the token come from and which was the internal ID of the user in the IDP.
 */
export type IdentitySource = {
  /**
   * The audience of the JWT, which is usually the clientID our appId.
   */
  aud: string;
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
};

/**
 * A BaseIdentity contains attributes shared by all types of Identity.
 * They also have a strongly typed 'attributes' property that is specific
 * to each kind of identity and its variants.
 */
export type BaseIdentity<TAttributes> = {
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
   * The attributes specific to the subtype of identity.
   */
  attributes: TAttributes;
  /**
   * A helper function for formatting the Identity in order to log it or audit it.
   * This is for diagnostics only.
   */
  toString(): string;
};

/**
 * This is a user that can interact with the systems of the city of Montreal.
 * The attributes will vary according to the type of user (citizen, employee, external user...).
 *
 * Since some users might have multiple profiles and thus multiple emails (like @montreal.ca, .adm@montreal.ca or @spvm.qc.ca)
 * that they can select at login time, you might want to consider the "accountProfile" attribute which categorizes them.
 * The ID will correctly identify the physical person but not the selected role.
 * So, you could combine ID+accountProfile or prefer the email in some cases, like when you need to evaluate the permissions.
 */
export type UserIdentity<TAttributes extends UserAttributes = UserAttributes> =
  BaseIdentity<TAttributes> & {
    /** The type of identity
     */
    type: 'user';
  };

/**
 * This is an employee, on the payroll of the city of Montreal.
 *
 * The ID is mapped to the username.
 */
export type EmployeeIdentity = UserIdentity<EmployeeAttributes>;

/**
 * This is an external user: an external collaborator or consultant that is not on the payroll of the city of Montreal,
 * but can access all internal services and has an email in the domain of Montreal (or SPVM).
 *
 * The ID is mapped to the username.
 */
export type ExternalUserIdentity = UserIdentity<ExternalUserAttributes>;

/**
 * This is a generic user: a user shared by employees or external users in order to perform QA tests in a non production environment.
 * Each generic user would have its own role or profile in the tested application, allowing one to perform the tasks required by the test.
 *
 * The ID is mapped to the username.
 */
export type GenericUserIdentity = UserIdentity<GenericUserAttributes>;

/**
 * This is a guest user: a user who doesn't work for the city of Montreal but needs to colloborate with a set of limited and specific services.
 * Note that, in theory, we could have guest users in other realms such as citizens (like sysadmins), but they cannot login at the moment and thus
 * we should only have tokens from the 'employees' realm.
 * Note that this kind of user might not have a firstName and lastName.
 *
 * The ID is mapped to the username.
 */
export type GuestUserIdentity = UserIdentity<GuestUserAttributes>;

/**
 * This is a citizen: a user consuming Montreal digital services.
 * There are regular citizen accounts for families as well as citizens acting on behalf of their organization.
 *
 * The ID of the citizen is managed by the DCI (Dossier Citoyen Intégré) and is known as mtlIdentityId.
 */
export type CitizenIdentity = UserIdentity<CitizenAttributes>;

/**
 * This is a user but we could not detect its type (employee, citizen...).
 * In this case, it means that the user has at least a username or an email.
 * All other common attributes might be defined but are not guaranteed.
 *
 * The ID of the unknown user will be mapped to the username when available, otherwise to the email.
 */
export type UnknownUserIdentity = UserIdentity<UnknownUserAttributes>;

/**
 * This is an anonymous user: a user consuming some basic digitital services that don't require to be identified,
 * such as reporting a pot hole in the street.
 *
 * The ID is mapped to the username.
 */
export type AnonymousIdentity = BaseIdentity<AnonymousAttributes> & {
  /** The type of identity */
  type: 'anonymous';
};

/**
 * This is a service account, without interactive logon, that allows a backend service or an automation to perform some tasks
 * with the required privileges (least privilege).
 * A service account has an ID, a display name and a secret (that expires after a few months).
 *
 * The ID is mapped to the 'aud' or the 'username', depending on the subtype.
 */
export type ServiceAccountIdentity<
  TAttributes extends ServiceAccountAttributes = ServiceAccountAttributes
> = BaseIdentity<TAttributes> & {
  /**
   * The type of identity
   */
  type: 'service-account';
};

/**
 * This is a service account, without interactive logon, that allows a backend service or an automation to perform some tasks
 * with the required privileges (least privilege).
 * A service account has an ID, a display name and a secret (that expires after a few months).
 *
 * The ID is mapped to the 'aud' which contains the appId in Azure or the inum in Gluu.
 */
export type ClientServiceAccountIdentity = ServiceAccountIdentity<ClientServiceAccountAttributes>;

/**
 * This is the old way of managing service accounts, with a real user provisioned (that's why there is a username property).
 * This kind of account as been deprecated (hence the legacy part) in favor of real service accounts that don't allow interactive logon.
 *
 * The id is mapped to the username.
 */
export type UserServiceAccountIdentity = ServiceAccountIdentity<UserServiceAccountAttributes>;

/**
 * An unknown identity has no specific attributes and defaults to this empty definition.
 */
export type UnknownAttributes = {
  type: 'unknown';
};

/**
 * This is the default identity when we could not match the proper one from the submitted JWT.
 * This might happen when we introduce a new type and this lib has not been updated in the client application,
 * but it should be very rare.
 *
 * The ID is mapped to the sub.
 */
export type UnknownIdentity = BaseIdentity<UnknownAttributes> & {
  /**
   * The type of identity
   */
  type: 'unknown';
};

/**
 * This is the Identity of the agent performing a request.
 * You would have to discriminate the right identity based on the 'type' property.
 * All identities will have a unique ID, a display name, a source, an attributes struct and a toString() function for formatting the values.
 */
export type Identity = AnonymousIdentity | UserIdentity | ServiceAccountIdentity | UnknownIdentity;
