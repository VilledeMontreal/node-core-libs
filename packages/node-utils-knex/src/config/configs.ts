import { ILogger } from '@villedemontreal/logger';
import * as path from 'path';

export class Configs {
  /**
   * Absolute path to the root of the project.
   */
  public root: string;

  constructor() {
    this.root = path.normalize(`${__dirname}/../../..`);
  }

  private _loggerCreator: (name: string) => ILogger;

  /**
   * The Logger creator
   */
  get loggerCreator(): (name: string) => ILogger {
    if (!this._loggerCreator) {
      throw new Error(`The Logger Creator HAS to be set as a configuration`);
    }
    return this._loggerCreator;
  }

  /**
   * Sets the Logger creator.
   */
  public setLoggerCreator(loggerCreator: (name: string) => ILogger) {
    this._loggerCreator = loggerCreator;
  }
}

export const configs: Configs = new Configs();
