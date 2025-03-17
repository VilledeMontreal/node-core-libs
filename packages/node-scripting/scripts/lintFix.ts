import { ScriptBase } from '../src';
import { configs } from '../src/config/configs';

export class LintFixScript extends ScriptBase {
  get name(): string {
    return 'lint-fix';
  }

  get description(): string {
    return `Fix the code using ESLint validation (including TSLint and Prettier rules).`;
  }

  protected async main() {
    const cmd = configs.findModulePath('node_modules/.bin/eslint');
    await this.invokeShellCommand(cmd, ['--fix', configs.libRoot]);
  }
}
