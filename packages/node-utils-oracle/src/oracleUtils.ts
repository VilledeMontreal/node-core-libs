// ==========================================
// Oracle utilities
// ==========================================

import { utils } from '@villedemontreal/general-utils';
import * as oracledb from 'oracledb';
import { createLogger } from './utils/logger';

const logger = createLogger('oracleUtils');

/**
 * Oracle utilities
 */
export class OracleUtils {
  /**
   * Creates an IN parameter for an Oracle stored
   * procedure for a base64 attachement (Clob in Oracle).
   *
   * Currently, I'm able to make the attachement
   * parameter works in the SQL query by :
   * - Setting the "type" attribute to "oracledb.CLOB" when there
   *   is no attachement.
   * - Removing the "type" attribute when there is an attachement.
   *
   * TODO Try to figure why doing it this way is required.
   *
   * @param contentBase64Encoded the Base64ed content to
   * insert.
   */
  public paramInBase64Attachment(contentBase64Encoded: string): any {
    const attachmentObj: any = {
      dir: oracledb.BIND_IN,
    };
    if (contentBase64Encoded) {
      attachmentObj.val = contentBase64Encoded;
    } else {
      attachmentObj.val = null;
      attachmentObj.type = oracledb.CLOB;
    }

    return attachmentObj;
  }

  /**
   * Creates a String IN parameter for an Oracle stored
   * procedure.
   */
  public paramInString(value: string): any {
    return {
      dir: oracledb.BIND_IN,
      type: oracledb.STRING,
      val: utils.getDefinedOrNull(value),
    };
  }

  /**
   * Creates a Number IN parameter for an Oracle stored
   * procedure.
   */
  public paramInNumber(value: number): any {
    return {
      dir: oracledb.BIND_IN,
      type: oracledb.NUMBER,
      val: utils.getDefinedOrNull(value),
    };
  }

  /**
   * Creates a String OUT parameter for an Oracle stored
   * procedure.
   */
  public paramOutString(): any {
    return {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
    };
  }

  /**
   * Creates a Number OUT parameter for an Oracle stored
   * procedure.
   */
  public paramOutNumber(): any {
    return {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    };
  }

  /**
   * Creates a Number Array OUT parameter for an Oracle stored
   * procedure.
   *
   * @param maxArraySize the value for the "maxArraySize"
   * property.
   */
  public paramOutNumberArray(maxArraySize: number): any {
    let maxArraySizeClean = maxArraySize;

    if (maxArraySizeClean === null || maxArraySizeClean === undefined || maxArraySizeClean < 1) {
      logger.warning(
        `The size of the array was not a positive integer greater than 0. '1' will be used instead of "${maxArraySizeClean}".`,
      );
      maxArraySizeClean = 1;
    }

    return {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
      maxArraySize: maxArraySizeClean,
    };
  }

  /**
   * Creates a Date OUT parameter for an Oracle stored
   * procedure.
   */
  public paramOutDate(): any {
    return {
      dir: oracledb.BIND_OUT,
      type: oracledb.DATE,
    };
  }
}
export const oracleUtils: OracleUtils = new OracleUtils();
