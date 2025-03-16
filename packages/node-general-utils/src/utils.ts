import { spawn, StdioOptions } from 'child_process';
import * as fs from 'fs';
import getPort from 'get-port';
import _ from 'lodash';
import * as pathUtils from 'path';
import { rimraf } from 'rimraf';
import * as tsconfig from 'tsconfig-extends';
import { constants } from './config/constants';

/**
 * General utilities
 */
export class Utils {
  private tscCompilerOptionsParams: string[];

  /**
   * Promisified setTimeout() utility function.
   *
   * @param ms The number of milliseconds to sleep for.
   */
  public async sleep(ms: number): Promise<void> {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Checks if a String is null, undefined,
   * empty, or contains only whitespaces.
   */
  public isBlank(str: string): boolean {
    if (str === null || str === undefined) {
      return true;
    }

    if (!(typeof str === 'string')) {
      return false;
    }

    return str.trim() === '';
  }

  /**
   * A better version of "isNaN()".
   * For example, an empty string is NOT considered as a
   * number.
   */
  public isNaNSafe(value: any): boolean {
    if (isNaN(value) || this.isBlank(value)) {
      return true;
    }

    const type = typeof value;
    if (type !== 'string' && type !== 'number') {
      return true;
    }

    return false;
  }

  /**
   * If the "el" is not undefined, returns it as is.
   * If the el is undefined, returns NULL.
   *
   * This is useful when undefined is not acceptable
   * but null is.
   */
  public getDefinedOrNull(el: any): any {
    if (el === undefined) {
      return null;
    }
    return el;
  }

  /**
   * Checks if a value is an integer.
   *
   * If you want to use the includeZero parameter without
   * using the positiveOnly parameter, we suggest to pass
   * undefined as a second parameter.
   *
   * After a positive check, we suggest to
   * pass the value with the Number object (Number(value))
   * to "clean" it, e.g., getting rid of unmeaningful
   * decimal zeros or whitespaces.
   */
  public isIntegerValue(value: any, positiveOnly = false, includeZero = true): boolean {
    if (this.isNaNSafe(value)) {
      return false;
    }

    // Convert to Number, if not already one
    const asNumber = Number(value);

    if (positiveOnly && asNumber < 0) {
      return false;
    }

    if (!includeZero && asNumber === 0) {
      return false;
    }

    // Busts integer safe limits
    if (asNumber > Number.MAX_SAFE_INTEGER || asNumber < Number.MIN_SAFE_INTEGER) {
      return false;
    }

    // If there were decimals but "0" only, it is
    // still considered as an Integer, and Number(value)
    // still have stripped those decimals....
    if ((asNumber + '').indexOf('.') > -1) {
      return false;
    }

    return true;
  }

  /**
   * Converts a string to a boolean.
   *
   * The string is TRUE only if it is
   * "true" (case insensitive) or "1"
   * (the *number* 1 is also accepted)
   *
   * Otherwise, it is considered as FALSE.
   */
  public stringToBoolean(str: string): boolean {
    if (str === null || str === undefined) {
      return false;
    }
    let strClean = str;

    if (typeof strClean === 'number') {
      strClean = str + '';
    } else if (typeof strClean !== 'string') {
      return false;
    }

    strClean = strClean.toLowerCase();
    if (strClean === 'true' || strClean === '1') {
      return true;
    }
    return false;
  }

  /**
   * Make sure a file is safe to delete, that is:
   * - It is truly
   * - It is not the path of a root directory or file
   */
  public isSafeToDelete(path: string): boolean {
    if (!path) {
      return false;
    }

    let pathClean = path;

    pathClean = pathUtils.normalize(pathClean);

    pathClean = pathClean.replace(/\\/g, '/');
    pathClean = _.trimEnd(pathClean, '/ ');

    return (pathClean.match(/\//g) || []).length > 1;
  }

  /**
   * Checks if a path points to an existing directory.
   *
   * @returns true if the path points to an existing
   * directory (not a file).
   */
  public isDir(dirPath: string): boolean {
    if (!dirPath || !fs.existsSync(dirPath)) {
      return false;
    }

    return fs.lstatSync(dirPath).isDirectory();
  }

  /**
   * Checks if a directory is empty.
   *
   * @returns true if the directory is empty or
   * doesn't exist. Returns false if the path
   * points to a *file* or to a directory that
   * is not empty.
   */
  public isDirEmpty(dirPath: string): boolean {
    if (fs.existsSync(dirPath)) {
      if (this.isDir(dirPath)) {
        const files = fs.readdirSync(dirPath);
        return !files || files.length === 0;
      }
      return false;
    }
    return true;
  }

  /**
   * Deletes a file, promisified and in a
   * solid way.
   *
   * You can't delete a root file using this function.
   */
  public deleteFile(filePath: string) {
    if (!this.isSafeToDelete(filePath)) {
      throw new Error("Unsafe file to delete. A file to delete can't be at the root.");
    }

    return rimraf(filePath);
  }

  /**
   * Deletes a directory, promisified and in a
   * solid way.
   *
   * You can't delete a root directory using this function.
   */
  public async deleteDir(dirPath: string) {
    if (!this.isSafeToDelete(dirPath)) {
      throw new Error("Unsafe dir to delete. A dir to delete can't be at the root.");
    }

    try {
      return rimraf(dirPath);
    } catch (err) {
      // ==========================================
      // Try recursively as rimraf may sometimes
      // fail in infrequent situations...
      // ==========================================
      await this.clearDir(dirPath);
      return rimraf(dirPath);
    }
  }

  /**
   * Clears a directory, promisified and in a
   * solid way.
   *
   * You can't clear a root directory using this function.
   */
  public async clearDir(dirPath: string) {
    if (!this.isSafeToDelete(dirPath)) {
      throw new Error("Unsafe dir to clear. A dir to clear can't be at the root.");
    }
    // NOTE: I had to replace the globby module with fs.readdir, because globby was not
    // listing the folders any more!
    return new Promise<void>((resolve, reject) => {
      fs.readdir(dirPath, async (err, paths: string[]) => {
        if (err) {
          reject(err);
          return;
        }
        for (const path of paths) {
          const filePath = pathUtils.join(dirPath, path);
          if (fs.lstatSync(filePath).isDirectory()) {
            await this.deleteDir(filePath);
          } else {
            await this.deleteFile(filePath);
          }
        }
        resolve();
      });
    });
  }

  protected get tscCompilerOptions(): string[] {
    if (!this.tscCompilerOptionsParams) {
      this.tscCompilerOptionsParams = [];
      const compilerOptions = tsconfig.load_file_sync(constants.appRoot + '/tsconfig.json');
      for (const key of Object.keys(compilerOptions)) {
        // ==========================================
        // TS6064: Option 'plugins' can only be specified in 'tsconfig.json' file.
        // ==========================================
        if (key === 'plugins') {
          continue;
        }

        // ==========================================
        // "--forceConsistentCasingInFileNames" sometimes
        // causes problems when running tests inside VSCode :
        // http://stackissue.com/Microsoft/vscode/lower-case-drive-letter-in-open-new-command-prompt-command-on-windows-9448.html
        // ==========================================
        if (key === 'forceConsistentCasingInFileNames' && process.env.ide === 'true') {
          compilerOptions[key] = false;
        }

        this.tscCompilerOptionsParams.push('--' + key);
        this.tscCompilerOptionsParams.push(compilerOptions[key]);
      }
    }
    return this.tscCompilerOptionsParams;
  }

  /**
   * Runs the "tsc" command on specific files
   * using the same options than the ones found
   * in the "tsconfig.json" file of the project.
   *
   * @param files the absolute paths of the files to compile.
   * @outdir allows us to redirect the output directory
   */
  public async tsc(files: string[]): Promise<void> {
    if (!files) {
      return;
    }

    const cmd = 'node';
    const args = [constants.libRoot + '/node_modules/typescript/lib/tsc.js']
      .concat(this.tscCompilerOptions)
      .concat(files);

    await this.execPromisified(cmd, args);
  }

  /**
   * Creates a "range", an array of continuous integers, from
   * "start" to "end".
   * Both "start" and "end" are inclusive.
   */
  public range = (start: number, end: number): number[] => {
    return [...Array(1 + end - start).keys()].map((v) => start + v);
  };

  /**
   * Returns a free port.
   */
  public async findFreePort(): Promise<number> {
    return await getPort();
  }

  /**
   * Validates if the object is of type Date and
   * is valid. Deserializing an invalid string
   * to a Date may result in a Date, but which is invalid.
   * Then loadash's isDate(d) is not enough to detect
   * if the result is valid or not. This function is.
   */
  public isValidDate(date: any): boolean {
    if (this.isBlank(date)) {
      return false;
    }
    return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
  }

  /**
   * To be used as a "@Transform" decorator on a
   * Date field, when using the "class-transformer"
   * library. For example :
   *
   * @Transform(utils.dateTransformer)
   * public created: Date;
   *
   * When using what class-transformer provides
   * by default ("@Type(() => Date)") there are cases
   * that are problematic :
   * - "123" and "true" :result in valid dates!
   *
   * Note : *only* use this decorator on the Date field, not
   * in addition to "@Type(() => Date)"!
   */
  public dateTransformer = (value: any): Date => {
    let date: Date;

    if (_.isNil(value)) {
      return null;
    }

    if (_.isDate(value)) {
      date = value;
    } else if (!_.isString(value) || utils.isBlank(value)) {
      // ==========================================
      // Makes sure it's an invalid date!
      // Because by default, true and 123 are accepted,
      // and are transform to valid dates!
      // ==========================================
      date = new Date(`invalid!`);
    } else {
      date = new Date(value);
    }

    return date;
  };

  /**
   * Throws an Error for the specified element as type "never".
   *
   * To be used in the "default" section of a switch/case statement.
   * This allows the validation at compile time that all elements of the
   * swtiched element are managed (as long as it is a discret type such
   * as an enum).
   */
  public throwNotManaged = (messagePrefix: string, element: never): void => {
    throw new Error(`${messagePrefix}: ${element}`);
  };

  /**
   * Returns TRUE if the parameter is an object but is not an array,
   * a Date or a function
   * By default, _.isObject(x) from Lodash also returns TRUE for
   * an Array, for a Date and a function.
   *
   * Returns FALSE for null/undefined.
   */
  public isObjectStrict = (val: any): boolean => {
    if (!val) {
      return false;
    }
    return _.isObject(val) && !_.isArray(val) && !_.isDate(val) && !_.isFunction(val);
  };

  /**
   * Returns TRUE if the specified "array" contains at least one object
   * that has the specified "key" and if the value associated with that key is
   * strictly equals to the specified "value".
   */
  public arrayContainsObjectWithKeyEqualsTo = (array: any[], key: string, value: any): boolean => {
    if (!array || !_.isArray(array) || array.length < 1) {
      return false;
    }

    for (const obj of array) {
      if (this.isObjectStrict(obj) && _.isEqual(obj[key], value)) {
        return true;
      }
    }

    return false;
  };

  /**
   * @deprecated Use `exec()` instead.
   */
  public execPromisified(
    command: string,
    args: string[],
    dataHandler: (stdoutData: string, stderrData: string) => void = null,
    useShellOption = false,
  ): Promise<void> {
    return this.exec(command, args, {
      outputHandler: dataHandler,
      useShellOption,
      disableConsoleOutputs: !dataHandler,
    }).then((_val: number) => {
      // nothing, returns void
    });
  }

  /**
   * Execute a shell command.
   *
   * This function is a promisified version of Node's `spawn()`
   * with extra options added
   * ( https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options ).
   *
   * @param bin The executable program to call.
   *
   * @param args The arguments for the program.
   *
   * @param options.successExitCodes The acceptable codes the
   *   process must exit with to be considered as a success.
   *   Defaults to [0].
   *
   * @param options.outputHandler A function that will receive
   *   the output of the process (stdOut and stdErr).
   *   This allows you to capture this output and manipulate it.
   *   No handler by default.
   *
   * @param options.disableConsoleOutputs Set to `true` in order
   *   to disable outputs in the current parent process
   *   (you can still capture them using a `options.dataHandler`).
   *   Defaults to `false`.
   *
   * @param options.stdio See https://nodejs.org/api/child_process.html#child_process_options_stdio
   *   Defaults to `['inherit', 'pipe', 'pipe']`.
   *
   * @param options.useShellOption See the "shell" option:
   *   https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
   *   Defaults to `true`.
   *
   * @returns The exit code
   *
   * @throws Will fail with a `ExecError` error if the process returns
   * a code different than `options.successExitCodes` ("0" by default).
   * The exit code would then be available in the generated Error:
   * `err.exitCode`.
   */
  public async exec(
    bin: string,
    args: string[] = [],
    options?: {
      successExitCodes?: number | number[];
      outputHandler?: (stdoutOutput: string, stderrOutput: string) => void;
      disableConsoleOutputs?: boolean;
      stdio?: StdioOptions;
      useShellOption?: boolean;
    },
  ): Promise<number> {
    const optionsClean = options ?? {};
    optionsClean.useShellOption = optionsClean.useShellOption ?? true;
    optionsClean.successExitCodes = optionsClean.successExitCodes
      ? _.isArray(optionsClean.successExitCodes)
        ? optionsClean.successExitCodes
        : [optionsClean.successExitCodes]
      : [0];
    optionsClean.stdio = optionsClean.stdio ?? ['inherit', 'pipe', 'pipe'];
    optionsClean.disableConsoleOutputs = optionsClean.disableConsoleOutputs ?? false;

    if (this.isBlank(bin)) {
      throw new ExecError(`The "bin" argument is required`, 1);
    }

    return new Promise<number>((resolve, reject) => {
      const spawnedProcess = spawn(bin, args, {
        detached: false,
        stdio: optionsClean.stdio,
        shell: optionsClean.useShellOption,
        windowsVerbatimArguments: false,
      });

      spawnedProcess.on('close', (code: number) => {
        const successExitCodes = optionsClean.successExitCodes as number[];
        if (!successExitCodes.includes(code)) {
          reject(
            new ExecError(
              `Expected success codes were "${successExitCodes.toString()}", but the process exited with "${code}".`,
              code,
            ),
          );
        } else {
          resolve(code);
        }
      });

      spawnedProcess.stdout.on('data', (output: string) => {
        const outputClean = output ? output.toString() : '';
        if (optionsClean.outputHandler) {
          optionsClean.outputHandler(outputClean, null);
        }

        if (!optionsClean.disableConsoleOutputs) {
          process.stdout.write(outputClean);
        }
      });

      spawnedProcess.stderr.on('data', (output: string) => {
        const outputClean = output ? output.toString() : '';
        if (optionsClean.outputHandler) {
          optionsClean.outputHandler(null, outputClean);
        }

        if (!optionsClean.disableConsoleOutputs) {
          process.stderr.write(outputClean);
        }
      });
    });
  }
}

/**
 * Error thrown when a process launched with `exec()` fails.
 */
// tslint:disable-next-line: max-classes-per-file
export class ExecError extends Error {
  constructor(
    message: string,
    public exitCode: number,
  ) {
    super(message);
  }
}

export function getValueDescription(value: any): string {
  return `« ${JSON.stringify(value)} »`;
}

export function getValueDescriptionWithType(value: any): string {
  const valueType = _.isObject(value) ? value.constructor.name : typeof value;
  return getValueDescription(value) + ` (${valueType})`;
}

export const utils: Utils = new Utils();
