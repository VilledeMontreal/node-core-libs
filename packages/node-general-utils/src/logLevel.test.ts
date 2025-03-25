import { assert } from 'chai';
import { LogLevel, logLevelFromString, logLevelToString } from './logLevel';

describe('logLevel', () => {
  it('logLevelFromString success', () => {
    assert.equal(logLevelFromString('debug'), LogLevel.DEBUG);
    assert.equal(logLevelFromString('Debug'), LogLevel.DEBUG);
    assert.equal(logLevelFromString('DEBUG'), LogLevel.DEBUG);
    assert.equal(logLevelFromString('info'), LogLevel.INFO);
    assert.equal(logLevelFromString('error'), LogLevel.ERROR);
    assert.equal(logLevelFromString('trace'), LogLevel.TRACE);
    assert.equal(logLevelFromString('warning'), LogLevel.WARNING);
  });

  it('logLevelFromString failure', () => {
    assert.isUndefined(logLevelFromString('zorg'));
  });

  it('logLevelFromString success', () => {
    assert.equal(logLevelToString(LogLevel.DEBUG), 'DEBUG');
    assert.equal(logLevelToString(LogLevel.ERROR), 'ERROR');
    assert.equal(logLevelToString(LogLevel.INFO), 'INFO');
    assert.equal(logLevelToString(LogLevel.TRACE), 'TRACE');
    assert.equal(logLevelToString(LogLevel.WARNING), 'WARNING');
  });
});
