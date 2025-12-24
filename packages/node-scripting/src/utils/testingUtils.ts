import { program as caporal } from '@villedemontreal/caporal';
import { globalConstants, utils } from '@villedemontreal/general-utils';
import { assert } from 'chai';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { stripVTControlCharacters } from 'node:util';
import { configs } from '../config/configs';

export function setTestingConfigs() {
  configs.setCaporal(caporal);
  configs.setProjectRoot(path.resolve(`${__dirname}/../../..`));
  configs.setProjectOutDir(`${configs.projectRoot}/dist`);
}

/**
 * The "--no-timeouts" arg doesn't work to disable
 * the Mocha timeouts (while debugging) if a timeout
 * is specified in the code itself. Using this to set the
 * timeouts does.
 */
export function timeout(mocha: Mocha.Suite | Mocha.Context, milliSec: number) {
  mocha.timeout(process.argv.includes('--no-timeouts') ? 0 : milliSec);
}

export function containsText(corpus: string, text: string) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.trim() !== '');
  if (lines.length === 0) {
    return false;
  }
  let lastIdx = -1;
  for (const line of lines) {
    const idx = corpus.indexOf(line, lastIdx);
    if (idx < 0) {
      console.log('Could not find line', line, 'in corpus', corpus);
      return false;
    }
    lastIdx = idx;
  }
  return true;
}

export async function run(...args: string[]) {
  return await runCore(configs.isWindows ? 'run.cmd' : './run', ...args);
}

export async function runCore(runFilePath: string, ...args: string[]) {
  let output = ``;
  let isSuccess = true;
  try {
    await utils.exec(runFilePath, args, {
      escapeArgs: true,
      outputHandler: (stdoutData: string, stderrData: string) => {
        const newOut = `${stdoutData ? ` ${stdoutData}` : ''} ${
          stderrData ? ` ${stderrData}` : ''
        } `;
        output += stripVTControlCharacters(newOut);
      },
    });
  } catch {
    isSuccess = false;
    // we have the output
  }
  return {
    output,
    isSuccess,
  };
}

export function isShortHelpDisplayed(output: string) {
  return (
    output.indexOf(`error: Unspecified command. Available commands are:`) > -1 &&
    output.indexOf(`For more help, type run --help`) > -1
  );
}

export function isMainHelpDisplayed(output: string) {
  return (
    output.indexOf(`to get some help about a command`) > -1 &&
    output.indexOf(`A simple testing script`) > -1 &&
    output.indexOf(`A testing hidden script`) <= -1
  );
}

export async function withCustomRunFile(
  toReplaceInRunFile: string,
  replacement: string,
  ...runArgs: string[]
): Promise<{ output: string; isSuccess: boolean }> {
  const runTestingFilePath = path.join(configs.libRoot, 'runTesting');
  let runContent = fs.readFileSync(path.join(configs.libRoot, 'run'), 'utf-8');
  runContent = runContent.replace(toReplaceInRunFile, replacement);

  const runCmdTestingFilePath = path.join(configs.libRoot, 'runTesting.cmd');
  let runCmdContent = fs.readFileSync(path.join(configs.libRoot, 'run.cmd'), 'utf-8');
  runCmdContent = runCmdContent.replace(`"%~dp0\\run"`, `"%~dp0\\runTesting"`);

  try {
    fs.writeFileSync(runTestingFilePath, runContent, 'utf-8');
    if (!configs.isWindows) {
      execSync(`chmod +x ${runTestingFilePath}`);
    }
    fs.writeFileSync(runCmdTestingFilePath, runCmdContent, 'utf-8');

    const { output, isSuccess } = await runCore(
      configs.isWindows ? 'runTesting.cmd' : './runTesting',
      ...runArgs,
    );
    return { output, isSuccess };
  } finally {
    if (fs.existsSync(runTestingFilePath)) {
      fs.unlinkSync(runTestingFilePath);
    }
    if (fs.existsSync(runCmdTestingFilePath)) {
      fs.unlinkSync(runCmdTestingFilePath);
    }
  }
}

export async function withLogNodeInstance(
  ...runArgs: string[]
): Promise<{ output: string; isSuccess: boolean }> {
  const mainJsPath = path.join(configs.libRoot, 'dist', 'src', 'main.js');
  const mainJsCodeOriginal = fs.readFileSync(mainJsPath, 'utf8');

  try {
    const anchor = `addUnhandledRejectionHandler();`;
    assert.isTrue(mainJsCodeOriginal.indexOf(anchor) > -1);

    const outputCode = `console.info('MAIN NODE_APP_INSTANCE: ' + process.env.${globalConstants.envVariables.NODE_APP_INSTANCE});`;

    const newCode = mainJsCodeOriginal.replace(anchor, `${anchor}\n${outputCode}`);
    fs.writeFileSync(mainJsPath, newCode, 'utf8');

    const { output, isSuccess } = await run(...runArgs);
    return { output, isSuccess };
  } finally {
    fs.writeFileSync(mainJsPath, mainJsCodeOriginal, 'utf8');
  }
}
