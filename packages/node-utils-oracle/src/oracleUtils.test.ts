// Ok in test files
// tslint:disable:max-func-body-length

// ==========================================
// Oracle Utils unit tests
// ==========================================
import { assert } from 'chai';
import * as oracledb from 'oracledb';
import { oracleUtils } from './oracleUtils';
import { setTestingConfigurations } from './utils/testingConfigurations';

// ==========================================
// Set Testing configurations
// ==========================================
setTestingConfigurations();

describe('Stored procedure parameters utilities', () => {
  // ==========================================
  // paramInBase64Attachment()
  // ==========================================
  describe('paramInBase64Attachment()', () => {
    it('existing content', () => {
      const result = oracleUtils.paramInBase64Attachment('some-base64-encoded-content');
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        val: 'some-base64-encoded-content',
      });
      assert.isUndefined(result.type);
    });

    it('undefined content', () => {
      const result = oracleUtils.paramInBase64Attachment(undefined);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        val: null,
        type: oracledb.CLOB,
      });
    });

    it('null content', () => {
      const result = oracleUtils.paramInBase64Attachment(null);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        val: null,
        type: oracledb.CLOB,
      });
    });

    it('empty content', () => {
      const result = oracleUtils.paramInBase64Attachment('');
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        val: null,
        type: oracledb.CLOB,
      });
    });
  });

  // ==========================================
  // paramInString()
  // ==========================================
  describe('paramInString()', () => {
    it('existing content', () => {
      const result = oracleUtils.paramInString('someValue');
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
        val: 'someValue',
      });
    });

    it('empty content', () => {
      const result = oracleUtils.paramInString('');
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
        val: '',
      });
    });

    it('undefined content => null value', () => {
      const result = oracleUtils.paramInString(undefined);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
        val: null,
      });
    });

    it('null content => null value', () => {
      const result = oracleUtils.paramInString(null);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
        val: null,
      });
    });
  });

  // ==========================================
  // paramInNumber()
  // ==========================================
  describe('paramInNumber()', () => {
    it('existing content', () => {
      const result = oracleUtils.paramInNumber(123);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
        val: 123,
      });
    });

    it("'0' content", () => {
      const result = oracleUtils.paramInNumber(0);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
        val: 0,
      });
    });

    it('negative content', () => {
      const result = oracleUtils.paramInNumber(-123);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
        val: -123,
      });
    });

    it('undefined content => null value', () => {
      const result = oracleUtils.paramInNumber(undefined);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
        val: null,
      });
    });

    it('null content => null value', () => {
      const result = oracleUtils.paramInNumber(null);
      assert.deepEqual(result, {
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
        val: null,
      });
    });
  });

  // ==========================================
  // paramOutString()
  // ==========================================
  describe('paramOutString()', () => {
    it('valid result', () => {
      const result = oracleUtils.paramOutString();
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
      });
    });
  });

  // ==========================================
  // paramOutString()
  // ==========================================
  describe('paramOutNumber()', () => {
    it('valid result', () => {
      const result = oracleUtils.paramOutNumber();
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      });
    });
  });

  // ==========================================
  // paramOutDate()
  // ==========================================
  describe('paramOutDate()', () => {
    it('valid result', () => {
      const result = oracleUtils.paramOutDate();
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.DATE,
      });
    });
  });

  // ==========================================
  // paramOutNumberArray()
  // ==========================================
  describe('paramOutNumberArray()', () => {
    it('positive number', () => {
      const result = oracleUtils.paramOutNumberArray(3);
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
        maxArraySize: 3,
      });
    });

    it("'0' number", () => {
      const result = oracleUtils.paramOutNumberArray(0);
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
        maxArraySize: 1,
      });
    });

    it('negative number', () => {
      const result = oracleUtils.paramOutNumberArray(-3);
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
        maxArraySize: 1,
      });
    });

    it('undefined number', () => {
      const result = oracleUtils.paramOutNumberArray(undefined);
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
        maxArraySize: 1,
      });
    });

    it('null number', () => {
      const result = oracleUtils.paramOutNumberArray(null);
      assert.deepEqual(result, {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
        maxArraySize: 1,
      });
    });
  });
});
