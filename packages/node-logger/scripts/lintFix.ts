import { ScriptBase } from '@villedemontreal/scripting/dist/src';
import { configs } from '../config/configs';

export class LintFixScript extends ScriptBase {
  get name(): string {
    return 'lint-fix';
  }

  get description(): string {
    return `Fix the code using ESLint and Prettier rules).`;
  }

  protected async main() {
    const projectRoot = `${configs.root}/..`;
    this.logger.info(`Fixing using Prettier rules`);
    await this.invokeShellCommand(`${projectRoot}/node_modules/.bin/prettier`, ['--write', '.']);

    this.logger.info(`Fixing using ESLint rules`);
    await this.invokeShellCommand(`${projectRoot}/node_modules/.bin/eslint`, ['--fix', '.']);
  }
}
