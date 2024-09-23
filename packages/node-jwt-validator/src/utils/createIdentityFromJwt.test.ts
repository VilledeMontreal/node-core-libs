import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createIdentityFromJwt } from './createIdentityFromJwt';

describe('createIdentityFromJwt', () => {
  it('should recognize an employee', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1721783045,
      iat: 1721777736,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'John DOE',
      sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
      userName: 'udoejo3',
      givenName: 'John',
      familyName: 'DOE',
      userType: 'employee',
      employeeNumber: '100674051',
      department: '421408000000',
      phoneMobileNumber: '5141111111',
      oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'john.doe@montreal.ca',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:employee:udoejo3:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm'
    );
    expect(`${identity}`).to.equal(
      'user:employee:udoejo3:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm'
    );
    if (identity.type === 'user') {
      // we test that the registration is optional when you don't know the type of user
      if (identity.attributes.registrationNumber) {
        expect(identity.attributes.registrationNumber).to.eql('100674051');
      } else {
        expect.fail('expected to find the registration number');
      }
      if (identity.attributes.type === 'employee') {
        // we test that the registrationNumber is not optional when type is employee
        expect(identity.attributes.registrationNumber.substring(0, 4)).to.eql('1006');
      } else {
        expect.fail('expected employee');
      }
    } else {
      expect.fail('expected user identity');
    }
    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'udoejo3',
      displayName: 'John DOE',
      attributes: {
        type: 'employee',
        email: 'john.doe@montreal.ca',
        username: 'udoejo3',
        registrationNumber: '100674051',
        department: '421408000000',
        firstName: 'John',
        lastName: 'DOE',
        accountProfile: 'vdm',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      },
    });
    // console.log(JSON.stringify(identity));
    expect(JSON.stringify(identity)).to.eql(
      `{"type":"user","id":"udoejo3","displayName":"John DOE","attributes":{"type":"employee","email":"john.doe@montreal.ca","username":"udoejo3","registrationNumber":"100674051","department":"421408000000","firstName":"John","lastName":"DOE","accountProfile":"vdm"},"source":{"aud":"e5dd632b-cb97-48d7-a310-5147be717cde","issuer":"security-identity-token-api","accessTokenIssuer":"https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0","env":"dev","realm":"employees","claim":"userName","internalId":"0b64042a-9cce-42dc-b645-cd721cbbc179"}}`
    );
  });

  it('should recognize an employee of SPVM', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1721783045,
      iat: 1721777736,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'John DOE',
      sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
      userName: 'udoejo3',
      givenName: 'John',
      familyName: 'DOE',
      userType: 'employee',
      employeeNumber: '100674051',
      department: 'PDQ 11',
      phoneMobileNumber: '5141111111',
      oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'john.doe@spvm.qc.ca',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:employee:udoejo3:John DOE:john.doe@spvm.qc.ca:100674051:PDQ 11:spvm'
    );
    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'udoejo3',
      displayName: 'John DOE',
      attributes: {
        type: 'employee',
        email: 'john.doe@spvm.qc.ca',
        username: 'udoejo3',
        registrationNumber: '100674051',
        department: 'PDQ 11',
        firstName: 'John',
        lastName: 'DOE',
        accountProfile: 'spvm',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      },
    });
    // console.log(JSON.stringify(identity));
  });

  it('should recognize an employee using his admin profile (Prod)', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1721783045,
      iat: 1721777736,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'John DOE',
      sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
      userName: 'udoejo3',
      givenName: 'John',
      familyName: 'DOE',
      userType: 'employee',
      employeeNumber: '100674051',
      department: '421408000000',
      phoneMobileNumber: '5141111111',
      oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'john.doe.adm@lavilledemontreal.omnicrosoft.com',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:employee:udoejo3:John DOE:john.doe.adm@lavilledemontreal.omnicrosoft.com:100674051:421408000000:vdm-admin'
    );
    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'udoejo3',
      displayName: 'John DOE',
      attributes: {
        type: 'employee',
        email: 'john.doe.adm@lavilledemontreal.omnicrosoft.com',
        username: 'udoejo3',
        registrationNumber: '100674051',
        department: '421408000000',
        firstName: 'John',
        lastName: 'DOE',
        accountProfile: 'vdm-admin',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      },
    });
    // console.log(JSON.stringify(identity));
  });
  it('should recognize an employee using his admin profile (LAB)', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1721783045,
      iat: 1721777736,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'John DOE',
      sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
      userName: 'udoejo3',
      givenName: 'John',
      familyName: 'DOE',
      userType: 'employee',
      employeeNumber: '100674051',
      department: '421408000000',
      phoneMobileNumber: '5141111111',
      oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'john.doe.adm@montrealville.omnicrosoft.com',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:employee:udoejo3:John DOE:john.doe.adm@montrealville.omnicrosoft.com:100674051:421408000000:vdm-admin'
    );
    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'udoejo3',
      displayName: 'John DOE',
      attributes: {
        type: 'employee',
        email: 'john.doe.adm@montrealville.omnicrosoft.com',
        username: 'udoejo3',
        registrationNumber: '100674051',
        department: '421408000000',
        firstName: 'John',
        lastName: 'DOE',
        accountProfile: 'vdm-admin',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      },
    });
    // console.log(JSON.stringify(identity));
  });
  it('should recognize an external user by its username (codeX)', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1721783045,
      iat: 1721777736,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'John DOE',
      sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
      userName: 'xdoejo3',
      givenName: 'John',
      familyName: 'DOE',
      userType: 'employee',
      phoneMobileNumber: '5141111111',
      oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'john.doe@montreal.ca',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:external:xdoejo3:John DOE:john.doe@montreal.ca::vdm'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'xdoejo3',
      displayName: 'John DOE',
      attributes: {
        type: 'external',
        email: 'john.doe@montreal.ca',
        username: 'xdoejo3',
        department: undefined,
        firstName: 'John',
        lastName: 'DOE',
        accountProfile: 'vdm',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      },
    });
  });
  it('should recognize an external user by its email (.ext)', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1721783045,
      iat: 1721777736,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'John DOE',
      sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
      userName: 'foobar',
      givenName: 'John',
      familyName: 'DOE',
      userType: 'employee',
      phoneMobileNumber: '5141111111',
      oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'john.doe.ext@montreal.ca',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:external:foobar:John DOE:john.doe.ext@montreal.ca::vdm'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'foobar',
      displayName: 'John DOE',
      attributes: {
        type: 'external',
        email: 'john.doe.ext@montreal.ca',
        username: 'foobar',
        department: undefined,
        firstName: 'John',
        lastName: 'DOE',
        accountProfile: 'vdm',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
      },
    });
  });
  it('should recognize a generic user', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722376780,
      iat: 1722371805,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'C.Generique dsec developpeur2',
      sub: 'mlKfaYaESpCXWGoHE3ej-kCaUBwfsQzqayvRvXXQHJo',
      userName: 'cgdsecdev2',
      givenName: 'C.Generique',
      familyName: 'dsec developpeur2',
      userType: 'employee',
      department: '4211',
      oid: '74096b4e-c090-4a97-af04-bbe25dc4f7d6',
      isGenericAccount: true,
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:generic:cgdsecdev2:C.Generique dsec developpeur2::4211:vdm'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'cgdsecdev2',
      displayName: 'C.Generique dsec developpeur2',
      attributes: {
        type: 'generic',
        username: 'cgdsecdev2',
        email: undefined,
        department: '4211',
        firstName: 'C.Generique',
        lastName: 'dsec developpeur2',
        accountProfile: 'vdm',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '74096b4e-c090-4a97-af04-bbe25dc4f7d6',
      },
    });
  });

  it('should recognize a guest user', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722376780,
      iat: 1722371805,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
      name: 'doe.daniel@hydro.qc.ca',
      sub: 'mlKfaYaGoHEESpCXW3ej-kCaUBwfsQzqayvRvXXQHJo',
      userName: 'doe.daniel_hydro.qc.ca#EXT#@lavilledemontreal.omnicrosoft.com',
      userType: 'employee',
      oid: '74096b4e-90c0-974a-af04-bbe25dc4f7d6',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'doe.daniel@hydro.qc.ca',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:guest:employees:doe.daniel_hydro.qc.ca#EXT#@lavilledemontreal.omnicrosoft.com:doe.daniel@hydro.qc.ca:doe.daniel@hydro.qc.ca'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'doe.daniel_hydro.qc.ca#EXT#@lavilledemontreal.omnicrosoft.com',
      displayName: 'doe.daniel@hydro.qc.ca',
      attributes: {
        type: 'guest',
        email: 'doe.daniel@hydro.qc.ca',
        username: 'doe.daniel_hydro.qc.ca#EXT#@lavilledemontreal.omnicrosoft.com',
        department: undefined,
        firstName: undefined,
        lastName: undefined,
        accountProfile: 'vdm',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '74096b4e-90c0-974a-af04-bbe25dc4f7d6',
      },
    });
  });

  it('should recognize an anonymous user', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722377045,
      iat: 1722373445,
      keyId: 6,
      displayName: 'Account Identity Managment',
      aud: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0008!2212.0010',
      name: 'srvAcc Anonymous',
      sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.1111.0020',
      inum: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.1111.0020',
      userName: 'srvAccAnonymous',
      givenName: 'srvAcc',
      familyName: 'Anonymous',
      userType: 'anonymous',
      realm: 'anonymous',
      env: 'dev',
      accessTokenIssuer: 'security-identity-anonymous-token-api',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal('anonymous:srvAccAnonymous:srvAcc Anonymous');

    delete identity.toString;
    expect(identity).to.eql({
      type: 'anonymous',
      id: 'srvAccAnonymous',
      displayName: 'srvAcc Anonymous',
      attributes: {
        type: 'anonymous',
        username: 'srvAccAnonymous',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer: 'security-identity-anonymous-token-api',
        aud: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0008!2212.0010',
        env: 'dev',
        realm: 'anonymous',
        claim: 'userName',
        internalId: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.1111.0020',
      },
    });
  });

  it('should recognize a client service account', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1721782408,
      iat: 1721778508,
      keyId: 6,
      displayName: 'infra-auth-auth-playground-dev',
      aud: 'e5dd632b-cb97-48d7-a310-cde5147be717',
      sub: 'e5dd632b-cb97-48d7-a310-cde5147be717',
      userType: 'client',
      oid: '18e8a9b0-876f-4a78-9934-ce3774903c2a',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'service-account:client:e5dd632b-cb97-48d7-a310-cde5147be717:infra-auth-auth-playground-dev'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'service-account',
      id: 'e5dd632b-cb97-48d7-a310-cde5147be717',
      displayName: 'infra-auth-auth-playground-dev',
      attributes: {
        type: 'client',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'e5dd632b-cb97-48d7-a310-cde5147be717',
        env: 'dev',
        realm: 'employees',
        claim: 'aud',
        internalId: '18e8a9b0-876f-4a78-9934-ce3774903c2a',
      },
    });
  });

  it('should recognize a user service account', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722375517,
      iat: 1722373717,
      keyId: 6,
      displayName: 'DiagnosticsCanary',
      aud: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0008!2212.0130',
      name: 'srvAcc Diagnostics Canary',
      sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.2222.0080',
      inum: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.2222.0080',
      userName: 'srvAccDiagCanary',
      givenName: 'srvAcc',
      familyName: 'srvAccDiagCanary',
      userType: 'serviceAccount',
      realm: 'citizens',
      env: 'dev',
      accessTokenIssuer: 'https://auth.dev.interne.montreal.ca',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'service-account:user:srvAccDiagCanary:srvAcc Diagnostics Canary'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'service-account',
      id: 'srvAccDiagCanary',
      displayName: 'srvAcc Diagnostics Canary',
      attributes: {
        type: 'user',
        username: 'srvAccDiagCanary',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer: 'https://auth.dev.interne.montreal.ca',
        aud: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0008!2212.0130',
        env: 'dev',
        realm: 'citizens',
        claim: 'userName',
        internalId: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.2222.0080',
      },
    });
  });

  it('should recognize a citizen', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722377562,
      iat: 1722373962,
      keyId: 6,
      displayName: 'infra-auth-auth-playground',
      aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
      name: 'John Doe',
      sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D',
      inum: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D',
      userName: 'john.doe@mailinator.com',
      givenName: 'John',
      familyName: 'Doe',
      oid: '7d69384b-dcf4-4972-ebb3-d546551c700f',
      realm: 'citizens',
      env: 'dev',
      accessTokenIssuer:
        'https://connexion.dev.montreal.ca/1543b575-116b-4325-a0bf-3ccdd7925321/v2.0/',
      mtlIdentityId: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D',
      email: 'john.doe@mailinator.com',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:citizen:@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D:John Doe:john.doe@mailinator.com'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D',
      displayName: 'John Doe',
      attributes: {
        type: 'citizen',
        username: 'john.doe@mailinator.com',
        email: 'john.doe@mailinator.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://connexion.dev.montreal.ca/1543b575-116b-4325-a0bf-3ccdd7925321/v2.0/',
        aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
        env: 'dev',
        realm: 'citizens',
        claim: 'mtlIdentityId',
        internalId: '7d69384b-dcf4-4972-ebb3-d546551c700f',
      },
    });
  });

  it('should default to unknown user identity', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722377562,
      iat: 1722373962,
      keyId: 6,
      displayName: 'infra-auth-auth-playground',
      aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
      name: 'John Doe',
      sub: '12345',
      userName: 'john.doe',
      userType: 'SomeUnknownType',
      givenName: 'John',
      familyName: 'Doe',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      email: 'john.doe@mailinator.com',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal(
      'user:unknown:john.doe:John Doe:john.doe@mailinator.com:::vdm'
    );

    delete identity.toString;
    expect(identity).to.eql({
      type: 'user',
      id: 'john.doe',
      displayName: 'John Doe',
      attributes: {
        type: 'unknown',
        email: 'john.doe@mailinator.com',
        username: 'john.doe',
        registrationNumber: undefined,
        department: undefined,
        firstName: 'John',
        lastName: 'Doe',
        accountProfile: 'vdm',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
        env: 'dev',
        realm: 'employees',
        claim: 'userName',
        internalId: '12345',
      },
    });
  });

  it('should default to unknown identity, with name', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722377562,
      iat: 1722373962,
      keyId: 6,
      displayName: 'infra-auth-auth-playground',
      aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
      name: 'John Doe',
      sub: '12345',
      userType: 'SomeUnknownType',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal('unknown:12345:John Doe');

    delete identity.toString;
    expect(identity).to.eql({
      type: 'unknown',
      id: '12345',
      displayName: 'John Doe',
      attributes: {
        type: 'unknown',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
        env: 'dev',
        realm: 'employees',
        claim: 'sub',
        internalId: '12345',
      },
    });
  });

  it('should default to unknown identity, without name', () => {
    const jwt: any = {
      iss: 'security-identity-token-api',
      exp: 1722377562,
      iat: 1722373962,
      keyId: 6,
      displayName: 'infra-auth-auth-playground',
      aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
      // name: 'John Doe',
      sub: '12345',
      userType: 'SomeUnknownType',
      realm: 'employees',
      env: 'dev',
      accessTokenIssuer:
        'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
    };
    const identity = createIdentityFromJwt(jwt);
    // console.log(identity);

    expect(identity.toString()).to.equal('unknown:12345:unknown');

    delete identity.toString;
    expect(identity).to.eql({
      type: 'unknown',
      id: '12345',
      displayName: 'unknown',
      attributes: {
        type: 'unknown',
      },
      source: {
        issuer: 'security-identity-token-api',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
        env: 'dev',
        realm: 'employees',
        claim: 'sub',
        internalId: '12345',
      },
    });
  });

  describe('should not recognize an employee when some required attributes are missing', () => {
    it('no registration number', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'udoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        // employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:udoejo3:John DOE:john.doe@montreal.ca::421408000000:vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'udoejo3',
        displayName: 'John DOE',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'udoejo3',
          registrationNumber: undefined,
          department: '421408000000',
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });

    it('no department', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'udoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        // department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:udoejo3:John DOE:john.doe@montreal.ca:100674051::vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'udoejo3',
        displayName: 'John DOE',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'udoejo3',
          registrationNumber: '100674051',
          department: undefined,
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });

    it('no valid codeU', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'usr_foo33',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:usr_foo33:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'usr_foo33',
        displayName: 'John DOE',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'usr_foo33',
          registrationNumber: '100674051',
          department: '421408000000',
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });
    it('no username', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        // userName: 'usr_foo33',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:john.doe@montreal.ca:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'john.doe@montreal.ca',
        displayName: 'John DOE',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: undefined,
          registrationNumber: '100674051',
          department: '421408000000',
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'email',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });
    it('no name', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        // name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'udoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:udoejo3:john.doe@montreal.ca:john.doe@montreal.ca:100674051:421408000000:vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'udoejo3',
        displayName: 'john.doe@montreal.ca',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'udoejo3',
          registrationNumber: '100674051',
          department: '421408000000',
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });
    it('no name and no email', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        // name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'udoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        // email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:udoejo3:udoejo3::100674051:421408000000:vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'udoejo3',
        displayName: 'udoejo3',
        attributes: {
          type: 'unknown',
          email: undefined,
          username: 'udoejo3',
          registrationNumber: '100674051',
          department: '421408000000',
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });
    it('no first name', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'udoejo3',
        // givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:udoejo3:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'udoejo3',
        displayName: 'John DOE',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'udoejo3',
          registrationNumber: '100674051',
          department: '421408000000',
          firstName: undefined,
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });
    it('no last name', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'udoejo3',
        givenName: 'John',
        // familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:udoejo3:John DOE:john.doe@montreal.ca:100674051:421408000000:vdm'
      );
      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'udoejo3',
        displayName: 'John DOE',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'udoejo3',
          registrationNumber: '100674051',
          department: '421408000000',
          firstName: 'John',
          lastName: undefined,
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
      // console.log(JSON.stringify(identity));
    });
  });
  describe('should not recognize an external user when some required attributes are missing', () => {
    it('invalid codeX', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'xdr_foo',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:xdr_foo:John DOE:john.doe@montreal.ca:::vdm'
      );

      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'xdr_foo',
        displayName: 'John DOE',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'xdr_foo',
          registrationNumber: undefined,
          department: undefined,
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
    });
    it('no name', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        // name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'xdoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      const identity = createIdentityFromJwt(jwt);
      // console.log(identity);

      expect(identity.toString()).to.equal(
        'user:unknown:xdoejo3:john.doe@montreal.ca:john.doe@montreal.ca:::vdm'
      );

      delete identity.toString;
      expect(identity).to.eql({
        type: 'user',
        id: 'xdoejo3',
        displayName: 'john.doe@montreal.ca',
        attributes: {
          type: 'unknown',
          email: 'john.doe@montreal.ca',
          username: 'xdoejo3',
          registrationNumber: undefined,
          department: undefined,
          firstName: 'John',
          lastName: 'DOE',
          accountProfile: 'vdm',
        },
        source: {
          issuer: 'security-identity-token-api',
          accessTokenIssuer:
            'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
          aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
          env: 'dev',
          realm: 'employees',
          claim: 'userName',
          internalId: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        },
      });
    });
  });
  describe('Exceptions', () => {
    it('the jwt parameter is mandatory', () => {
      expect(() => createIdentityFromJwt(null)).throws('"jwt" parameter is required');
    });
    it('the jwt MUST have a sub', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        // sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'xdoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        'expected to find the "sub" claim in the JWT'
      );
    });
    it('optional string claim should be a string and not a number', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'xdoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        phoneMobileNumber: '5141111111',
        oid: 1234,
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        `claim 'oid' to contain a string but received: 1234`
      );
    });
    it('external users should belong to the employees realm', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'xdoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'citizens',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        'expected token to belong to the "employees" realm'
      );
    });
    it('anonymous users should belong to the anonymous realm', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1722377045,
        iat: 1722373445,
        keyId: 6,
        displayName: 'Account Identity Managment',
        aud: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0008!2212.0010',
        name: 'srvAcc Anonymous',
        sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.1111.0020',
        inum: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.1111.0020',
        userName: 'srvAccAnonymous',
        givenName: 'srvAcc',
        familyName: 'Anonymous',
        userType: 'anonymous',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer: 'security-identity-anonymous-token-api',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        'anonymous: expected token to belong to the "anonymous" realm'
      );
    });
    it('citizen users should belong to the citizens realm', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1722377562,
        iat: 1722373962,
        keyId: 6,
        displayName: 'infra-auth-auth-playground',
        aud: 'a496befa-db7d-45a6-ac7a-11471816b8f1',
        name: 'John Doe',
        sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D',
        inum: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D',
        userName: 'john.doe@mailinator.com',
        givenName: 'John',
        familyName: 'Doe',
        oid: '7d69384b-dcf4-4972-ebb3-d546551c700f',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://connexion.dev.montreal.ca/1543b575-116b-4325-a0bf-3ccdd7925321/v2.0/',
        mtlIdentityId: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!3F39.BEDB.4ADB.F74D',
        email: 'john.doe@mailinator.com',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        'user:citizen: expected token to belong to the "citizens" realm'
      );
    });
    it('employee users should belong to the employees realm', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721783045,
        iat: 1721777736,
        keyId: 6,
        displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-5147be717cde',
        name: 'John DOE',
        sub: 'uuUOZLMFfuURgumF2hE2Z0ZIrVLqLoDy85AeicCJSHQ',
        userName: 'udoejo3',
        givenName: 'John',
        familyName: 'DOE',
        userType: 'employee',
        employeeNumber: '100674051',
        department: '421408000000',
        phoneMobileNumber: '5141111111',
        oid: '0b64042a-9cce-42dc-b645-cd721cbbc179',
        realm: 'citizens',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
        email: 'john.doe@montreal.ca',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        'user:employee: expected token to belong to the "employees" realm'
      );
    });
    it('getStringClaim with identityType error', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1722377045,
        iat: 1722373445,
        keyId: 6,
        displayName: 'Account Identity Managment',
        aud: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0008!2212.0010',
        name: 'srvAcc Anonymous',
        sub: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.1111.0020',
        inum: '@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!0000.1111.0020',
        // userName: 'srvAccAnonymous',
        givenName: 'srvAcc',
        familyName: 'Anonymous',
        userType: 'anonymous',
        realm: 'anonymous',
        env: 'dev',
        accessTokenIssuer: 'security-identity-anonymous-token-api',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        'anonymous: expected to find the "userName" claim in the JWT'
      );
    });
    it('getStringClaim with identityType and subType error', () => {
      const jwt: any = {
        iss: 'security-identity-token-api',
        exp: 1721782408,
        iat: 1721778508,
        keyId: 6,
        // displayName: 'infra-auth-auth-playground-dev',
        aud: 'e5dd632b-cb97-48d7-a310-cde5147be717',
        sub: 'e5dd632b-cb97-48d7-a310-cde5147be717',
        userType: 'client',
        oid: '18e8a9b0-876f-4a78-9934-ce3774903c2a',
        realm: 'employees',
        env: 'dev',
        accessTokenIssuer:
          'https://login.microsoftonline.com/9f15d2dc-8753-4f83-aac2-a58288d3a4bc/v2.0',
      };
      expect(() => createIdentityFromJwt(jwt)).throws(
        'service-account: client: expected to find the "displayName" claim in the JWT'
      );
    });
  });
});
