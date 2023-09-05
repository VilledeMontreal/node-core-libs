// ==========================================
// The Log levels
//
// We defined thos ein this library and not
// in the "@villemontreal/core-utils-logger-nodejs-lib"
// library because they are used here, and we
// want to prevent circular dependencies as much as
// possible.
// ==========================================

/**
 * Log levels enum
 */
export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARNING,
  ERROR
}

/**
 * Converts log level string representation to its associated
 * LogLevel enum value.
 */
export const logLevelFromString = (levelStr: string): LogLevel => {
  if (levelStr) {
    return LogLevel[levelStr.toUpperCase()];
  }
  return undefined;
};

/**
 * Converts a LogLevel to its string representation.
 */
export const logLevelToString = (logLevel: LogLevel): string => {
  if (isNaN(logLevel)) {
    return undefined;
  }
  return LogLevel[logLevel];
};
