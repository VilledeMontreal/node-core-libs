// ==========================================
// Application constants
// ==========================================
import { path as appRoot } from 'app-root-path';
import * as path from 'path';

/**
 * Application constants
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
    this.libRoot = path.normalize(__dirname + '/../../..');
    this.appRoot = appRoot;
  }
}

export const constants: Constants = new Constants();
