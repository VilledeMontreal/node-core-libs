import * as fs from 'fs';
import * as path from 'path';
import { path as appRoot } from 'app-root-path';

/**
 * Library constants
 */
export class Constants {
  /**
   * The library root. When this library is used
   * as a dependency in a project, the "libRoot"
   * will be the path to the dependency folder,
   * inside the "node_modules".
   */
  public libRoot: string;

  /**
   * The app root. When this library is used
   * as a dependency in a project, the "appRoot"
   * will be the path to the root project!
   */
  public appRoot: string;

  constructor() {
    // From the "dist/src/config" folder
    this.libRoot = path.normalize(path.join(__dirname, '../..'));
    this.appRoot = appRoot;
  }

  // ==========================================
  // Directory path for test data
  // ==========================================
  get testDataDirPath() {
    return path.join(this.libRoot, 'test-data');
  }

  public findModulePath(subPath: string): string {
    let current = this.libRoot;
    let counter = 0;
    while (counter < 10 && current !== '/' && fs.existsSync(current)) {
      const p = path.join(current, subPath);
      if (fs.existsSync(p)) {
        return path.normalize(p);
      }
      current = path.normalize(path.join(current, '..'));
      counter += 1;
    }
    throw new Error(`Could not find module "${subPath}"`);
  }
}

export const constants: Constants = new Constants();
