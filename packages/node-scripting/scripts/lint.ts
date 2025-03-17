import { ScriptBase } from '../src';
import { configs } from '../src/config/configs';

export class LintScript extends ScriptBase {
  get name(): string {
    return 'lint';
  }

  get description(): string {
    return `Run the ESLint validation (including TSLint and Prettier rules).`;
  }

  protected async main() {
    const cmd = configs.findModulePath('node_modules/.bin/eslint');
    await this.invokeShellCommand(cmd, [configs.libRoot]);
  }
}
