/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-require-imports */

import * as chai from 'chai';
import { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import * as fs from 'fs-extra';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import {
  LoggerRecorder,
  simulateSonarProjectAlreadyExists,
  simulateSonarProjectDoesNotYetExist,
  simulateSonarServerIsNotFound,
} from '../../src/utils/sonarTestUtils';
import { setTestingConfigs, timeout } from '../../src/utils/testingUtils';
import { SONAR_SCANNER } from './sonar';
import { SonarInitScript } from './sonarInit';

const nock = require('nock');

chai.use(chaiAsPromised);
chai.use(sinonChai);

const sandbox = sinon.createSandbox();

function getSonarInitScript(logger: object): SonarInitScript {
  return new SonarInitScript({
    args: {},
    options: {},
    program: sinon.stub() as any,
    command: sinon.stub() as any,
    ddash: sinon.stub() as any,
    logger: logger as any,
  });
}

const validPropertyFiles = [
  './src/utils/test-sonar-project_url-with-trailing-slash.properties',
  './src/utils/test-sonar-project_url-without-trailing-slash.properties',
];

describe('sonar-init script', function () {
  timeout(this, 30000);

  before(() => {
    setTestingConfigs();
  });

  it(` should fail when sonar-project.properties is missing`, async () => {
    const loggerRecorder = new LoggerRecorder();
    const sonarInitScript = getSonarInitScript(loggerRecorder.logger);

    await expect(sonarInitScript.run()).to.be.rejectedWith(
      Error,
      '"sonar-project.properties" file does not exist!'
    );

    expect(loggerRecorder.recordedLogs).to.equal(`info: Script "sonar-init" starting...
error: Script "sonar-init" failed after 0 s with: "sonar-project.properties" file does not exist!
`);
  });

  validPropertyFiles.forEach((propertyFile) => {
     
    describe(` when using "${propertyFile}" valid property file`, function() {
      before(async () => {
        await fs.copyFile(propertyFile, './sonar-project.properties');
      });
      after(async () => {
        await fs.unlink('./sonar-project.properties');
      });

      afterEach(() => {
        nock.cleanAll();
        sandbox.restore();
      });

      it(` should skip sonar project initialization with a warning when it does already exist.`, async () => {
        simulateSonarProjectAlreadyExists();

        // @ts-ignore
        const shellCommand = sandbox.spy(SonarInitScript.prototype, 'invokeShellCommand');

        const loggerRecorder = new LoggerRecorder();
        const sonarInitScript = getSonarInitScript(loggerRecorder.logger);

        await sonarInitScript.run();

        assert.isTrue(
          nock.isDone(),
          `There are remaining expected HTTP calls: ${nock.pendingMocks().toString()}`
        );

        expect(loggerRecorder.recordedLogs)
          .to.satisfy((s: string) => s.startsWith('info: Script "sonar-init" starting...\n'))
          .and.to.contain("info: Initializing 'my-test-project-key' Sonar project...\n")
          .and.to.contain(
            "warn: 'my-test-project-key' Sonar project already exists at https://example.com/sonar/dashboard?id=my-test-project-key ! Skipping sonar initialization...\n"
          )
          .and.to.satisfy((s: string) => s.endsWith('info: Script "sonar-init" successful after 0 s\n'));

        // @ts-ignore
        expect(shellCommand).to.not.have.been.called;
      });

      it(` should initialize sonar project when it does not yet exist.`, async () => {
        simulateSonarProjectDoesNotYetExist();

        const loggerRecorder = new LoggerRecorder();
        const sonarInitScript = getSonarInitScript(loggerRecorder.logger);

        await sonarInitScript.run();

        assert.isTrue(
          nock.isDone(),
          `There are remaining expected HTTP calls: ${nock.pendingMocks().toString()}`
        );

        expect(loggerRecorder.recordedLogs)
          .to.satisfy((s: string) => s.startsWith('info: Script "sonar-init" starting...\n'))
          .and.to.contain("info: Initializing 'my-test-project-key' Sonar project...\n")
          .and.to.contain(
            "info: 'my-test-project-key' Sonar project successfully initialized, and available at https://example.com/sonar/dashboard?id=my-test-project-key\n"
          )
          .and.to.satisfy((s: string) => s.endsWith('info: Script "sonar-init" successful after 0 s\n'));

        expect(loggerRecorder.recordedLogs).to.not.contain('warn');
      });

      it(` should fail when sonar project initialization fails.`, async () => {
        simulateSonarProjectDoesNotYetExist();

        // @ts-ignore
        const shellCommand = sandbox.stub(SonarInitScript.prototype, 'invokeShellCommand');
        shellCommand
          .withArgs(SONAR_SCANNER as any)
          .rejects(new Error('An error occured while analyzing code.'));

        const loggerRecorder = new LoggerRecorder();
        const sonarInitScript = getSonarInitScript(loggerRecorder.logger);

        await expect(sonarInitScript.run()).to.be.rejectedWith(
          Error,
          'An error occured while analyzing code.'
        );

        assert.isTrue(
          nock.isDone(),
          `There are remaining expected HTTP calls: ${nock.pendingMocks().toString()}`
        );

        expect(loggerRecorder.recordedLogs)
          .to.satisfy((s: string) => s.startsWith('info: Script "sonar-init" starting...\n'))
          .and.to.contain("info: Initializing 'my-test-project-key' Sonar project...\n")
          .and.to.satisfy((s: string) => s.endsWith(
            'error: Script "sonar-init" failed after 0 s with: An error occured while analyzing code.\n'
          ));

        expect(loggerRecorder.recordedLogs).to.not.contain('warn');

        expect(shellCommand).to.have.been.calledOnceWithExactly(SONAR_SCANNER, []);
      });

      it(` should fail when sonar server is not found.`, async () => {
        simulateSonarServerIsNotFound();

        // @ts-ignore
        const shellCommand = sandbox.spy(SonarInitScript.prototype, 'invokeShellCommand');

        const loggerRecorder = new LoggerRecorder();
        const sonarInitScript = getSonarInitScript(loggerRecorder.logger);

        await expect(sonarInitScript.run()).to.be.rejectedWith(Error, 'Not Found');

        assert.isTrue(
          nock.isDone(),
          `There are remaining expected HTTP calls: ${nock.pendingMocks().toString()}`
        );

        expect(loggerRecorder.recordedLogs)
          .to.satisfy((s: string) => s.startsWith('info: Script "sonar-init" starting...\n'))
          .and.to.contain("info: Initializing 'my-test-project-key' Sonar project...\n")
          .and.to.contain.oneOf([
            'error: "https://example.com/sonar/" Sonar server is not reachable.',
            'error: "https://example.com/sonar" Sonar server is not reachable.',
          ])
          .and.to.satisfy((s: string) => s.endsWith('error: Script "sonar-init" failed after 0 s with: Not Found\n'));

        expect(loggerRecorder.recordedLogs).to.not.contain('warn');

        expect(shellCommand).to.not.have.been.called;
      });
    });
  });
});
