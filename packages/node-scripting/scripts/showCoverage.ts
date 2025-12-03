import { Command, program } from '@villedemontreal/caporal';
import * as path from 'path';
import { ScriptBase } from '../src';
import { configs } from '../src/config/configs';
import { execa } from 'execa';

export interface Options {
  report?: string;
}

export class ShowCoverageScript extends ScriptBase<Options> {
  get name(): string {
    return 'show-coverage';
  }

  get description(): string {
    return `Open the tests coverage report.`;
  }

  protected get requiredDependencies(): string[] {
    return ['nyc'];
  }

  protected async configure(command: Command): Promise<void> {
    command.option(`--report <path>`, `The relative path to the coverage report directory.`, {
      default: `output/coverage`,
      validator: program.STRING,
    });
  }

  protected async main() {
    if (process.platform === 'win32') {
      await execa({
        stdout: 'inherit',
        stderr: 'inherit',
        shell: true,
      })`start ${this.getReportDir()}`;
    } else {
      await execa({
        stdout: 'inherit',
        stderr: 'inherit',
      })`open ${this.getReportDir()}`;
    }
  }

  protected getReportDir() {
    const reportDir = path.resolve(
      configs.projectRoot,
      this.options.report,
      'lcov-report',
      'index.html',
    );
    return reportDir;
  }
}
