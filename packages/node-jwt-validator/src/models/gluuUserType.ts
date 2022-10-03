/**
 * The possible values of the "userType", in a JWT.
 * Note that an empty (or non existent) "userType"
 * means it is the JWT of a regular citizen.
 */
export enum GluuUserType {
  EMPLOYEE = 'employee',
  SERVICE_ACCOUNT = 'serviceAccount',
}
