import { Command, program } from '@villedemontreal/caporal';
import * as _ from 'lodash';
import { ScriptBase } from '../src';
import { configs } from '../src/config/configs';
import { execa } from 'execa';
import * as path from 'path';
import { globalConstants } from '@villedemontreal/general-utils';

const TESTS_LOCATIONS = [`${configs.libRoot}/dist/src/**/*.test.js`];

export interface Options {
  bail?: boolean;
  jenkins?: boolean;
  report?: string;
}

export class TestUnitsScript extends ScriptBase<Options> {
  get name(): string {
    return 'test-units';
  }

  get description(): string {
    return `Run the unit tests.`;
  }

  protected async configure(command: Command): Promise<void> {
    command.option(`--bail`, `Stop the execution of the tests as soon as an error occures.`);
    command.option(`--jenkins`, `Configure the tests to be run by Jenkins.`);
    command.option(
      `--report <path>`,
      `The relative path to the report, when the tests are run for Jenkins.`,
      {
        default: `output/test-results/report.xml`,
        validator: program.STRING,
      },
    );
  }

  protected get requiredDependencies(): string[] {
    const deps = ['mocha'];
    if (this.options.jenkins) {
      deps.push('@villedemontreal/mocha-jenkins-reporter');
    }
    return deps;
  }

  protected async main() {
    const cmdArgs = [];

    if (await this.isProjectDirectDependency(`nyc`)) {
      cmdArgs.push(`nyc`);
    } else {
      this.logger.warn(
        `The "nyc" direct dependency was not found in your project. The tests will be run using Mocha only!`,
      );
    }

    cmdArgs.push(`mocha`);

    // ==========================================
    // The test locations need to be quoted because
    // they may contain a "**" wildcard that some
    // shells may interpret differently otherwise!
    //
    // @see https://mochajs.org/#the-test-directory
    // ==========================================
    cmdArgs.push(...TESTS_LOCATIONS);

    cmdArgs.push(`--exit`);

    // ==========================================
    // Stop testing as soon as one test fails?
    // ==========================================
    if (this.options.bail) {
      cmdArgs.push('--bail');
    }

    // ==========================================
    // For Jenkins, the path to the report to generate
    // can be passed :
    // - as a command line param :
    //   "run test-units --jenkins --report output/test-results/report.xml"
    // - as an "JUNIT_REPORT_PATH" environment variable.
    //
    // By default, the path will be "output/test-results/report.xml"
    // ==========================================
    if (this.options.jenkins) {
      if (this.options.report) {
        process.env.JUNIT_REPORT_PATH = this.options.report;
      } else if (!process.env.JUNIT_REPORT_PATH) {
        process.env.JUNIT_REPORT_PATH = path.join('output', 'test-results', 'report.xml');
      }

      this.logger.info('Exporting tests to junit file ' + process.env.JUNIT_REPORT_PATH);
      cmdArgs.push('--reporter');
      cmdArgs.push('@villedemontreal/mocha-jenkins-reporter');
    }

    const env: Record<string, string> = {};
    env[globalConstants.envVariables.NODE_APP_INSTANCE] = globalConstants.appInstances.TESTS;

    try {
      await execa({
        preferLocal: true,
        stdout: 'inherit',
        stderr: 'inherit',
        env,
        extendEnv: true,
      })`${cmdArgs}`;

      this.logger.info(
        "   \u21b3  type 'run show-coverage' (or './run show-coverage' on Linux/Mac) to display the HTML report",
      );
    } catch (err) {
      this.logger.error(err.shortMessage);
      throw new Error('Some unit tests failed');
    }
  }
}
