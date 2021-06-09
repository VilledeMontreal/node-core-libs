// ==========================================
// Utils functions unit tests
//
// Disabling the "function length" rule is OK for the test files.
// tslint:disable:max-func-body-length
// tslint:disable: prefer-template
// ==========================================

import { assert } from 'chai';
import * as fs from 'fs-extra';
import { v4 as uuid } from 'uuid';
import { constants } from './config/constants';
import { ExecError, utils, Utils } from './utils';

// A regular "function" is required here for the call to "this.timeout(...)"
// @see https://github.com/mochajs/mocha/issues/2018
// tslint:disable-next-line:only-arrow-functions ter-prefer-arrow-callback
describe("App's utilities functions", function() {
  // ==========================================
  // tsc()
  // ==========================================
  describe('tsc', () => {
    it("Compiles a TypeScript file using the 'tsc()' utility", async function() {
      if (!fs.existsSync(constants.testDataDirPath)) {
        fs.mkdirSync(constants.testDataDirPath);
      }

      // May take some time to compile...
      this.timeout(20000);

      const tmpRepPath = constants.testDataDirPath + '/test_tsc';
      if (fs.existsSync(tmpRepPath)) {
        fs.removeSync(tmpRepPath);
      }
      fs.mkdirSync(tmpRepPath);

      const fileName = uuid();
      const filesPathPrefix = tmpRepPath + '/' + fileName;
      const tsFilePath = filesPathPrefix + '.ts';
      fs.writeFileSync(tsFilePath, `import * as path from 'path';\nlet t = 'a';\nt = t + path.sep;`);

      const distRepPath = constants.libRoot + '/dist';

      await utils.tsc([tsFilePath]);
      assert.isTrue(fs.existsSync(distRepPath + '/test-data/test_tsc/' + fileName + '.js'));
      assert.isTrue(fs.existsSync(distRepPath + '/test-data/test_tsc/' + fileName + '.js.map'));
      assert.isTrue(fs.existsSync(distRepPath + '/test-data/test_tsc/' + fileName + '.d.ts'));

      fs.removeSync(distRepPath + '/test-data');
    });
  });

  // ==========================================
  // stringToBoolean()
  // ==========================================
  describe('stringToBoolean()', () => {
    it('valid TRUE values', () => {
      let result: boolean = utils.stringToBoolean('true');
      assert.isTrue(result);

      result = utils.stringToBoolean('TRUE');
      assert.isTrue(result);

      result = utils.stringToBoolean('True');
      assert.isTrue(result);

      result = utils.stringToBoolean('1');
      assert.isTrue(result);

      result = utils.stringToBoolean(1 as any);
      assert.isTrue(result);
    });

    it('Everything else is FALSE', () => {
      let result: boolean = utils.stringToBoolean('true   ');
      assert.isFalse(result);

      result = utils.stringToBoolean('    1   ');
      assert.isFalse(result);

      result = utils.stringToBoolean('vrai');
      assert.isFalse(result);

      result = utils.stringToBoolean('on');
      assert.isFalse(result);

      result = utils.stringToBoolean('false');
      assert.isFalse(result);

      result = utils.stringToBoolean('FALSE');
      assert.isFalse(result);

      result = utils.stringToBoolean('Stromgol');
      assert.isFalse(result);

      result = utils.stringToBoolean('');
      assert.isFalse(result);

      result = utils.stringToBoolean(null);
      assert.isFalse(result);

      result = utils.stringToBoolean('12.345');
      assert.isFalse(result);

      result = utils.stringToBoolean(2 as any);
      assert.isFalse(result);

      result = utils.stringToBoolean(0 as any);
      assert.isFalse(result);

      result = utils.stringToBoolean(-1 as any);
      assert.isFalse(result);

      result = utils.stringToBoolean({} as any);
      assert.isFalse(result);

      result = utils.stringToBoolean([] as any);
      assert.isFalse(result);
    });
  });

  // ==========================================
  // isBlank()
  // ==========================================
  describe('isBlank()', () => {
    it('blank values', () => {
      let result: boolean = utils.isBlank('');
      assert.isTrue(result);

      result = utils.isBlank('      ');
      assert.isTrue(result);

      result = utils.isBlank(null);
      assert.isTrue(result);

      result = utils.isBlank(undefined);
      assert.isTrue(result);
    });

    it('Not blank values', () => {
      let result: boolean = utils.isBlank('.');
      assert.isFalse(result);

      result = utils.isBlank('   .   ');
      assert.isFalse(result);

      result = utils.isBlank('abc');
      assert.isFalse(result);

      result = utils.isBlank(0 as any);
      assert.isFalse(result);

      result = utils.isBlank(1 as any);
      assert.isFalse(result);

      result = utils.isBlank({} as any);
      assert.isFalse(result);

      result = utils.isBlank([] as any);
      assert.isFalse(result);
    });
  });

  // ==========================================
  // isIntegerValue()
  // ==========================================
  describe('isIntegerValue()', () => {
    it('Integer values', () => {
      let result: boolean = utils.isIntegerValue(0);
      assert.isTrue(result);

      result = utils.isIntegerValue(1);
      assert.isTrue(result);

      result = utils.isIntegerValue(10.0);
      assert.isTrue(result);

      result = utils.isIntegerValue(10);
      assert.isTrue(result);

      result = utils.isIntegerValue('10');
      assert.isTrue(result);

      result = utils.isIntegerValue(' 10');
      assert.isTrue(result);

      result = utils.isIntegerValue('10 ');
      assert.isTrue(result);

      result = utils.isIntegerValue('10.0');
      assert.isTrue(result);

      result = utils.isIntegerValue('0');
      assert.isTrue(result);

      result = utils.isIntegerValue('1');
      assert.isTrue(result);

      result = utils.isIntegerValue(-1);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10.0);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10);
      assert.isTrue(result);

      result = utils.isIntegerValue('-10');
      assert.isTrue(result);

      result = utils.isIntegerValue(' -10');
      assert.isTrue(result);

      result = utils.isIntegerValue('-10 ');
      assert.isTrue(result);

      // MAX_SAFE_INTEGER
      result = utils.isIntegerValue(9007199254740991);
      assert.isTrue(result);

      result = utils.isIntegerValue(9007199254740991.0);
      assert.isTrue(result);

      result = utils.isIntegerValue('9007199254740991');
      assert.isTrue(result);

      result = utils.isIntegerValue('9007199254740991.000');
      assert.isTrue(result);

      // MIN_SAFE_INTEGER
      result = utils.isIntegerValue(-9007199254740991);
      assert.isTrue(result);

      result = utils.isIntegerValue(-9007199254740991.0);
      assert.isTrue(result);

      result = utils.isIntegerValue('-9007199254740991');
      assert.isTrue(result);

      result = utils.isIntegerValue('-9007199254740991.000');
      assert.isTrue(result);
    });

    it('Not integer values', () => {
      let result: boolean = utils.isIntegerValue('.');
      assert.isFalse(result);

      result = utils.isIntegerValue('');
      assert.isFalse(result);

      result = utils.isIntegerValue('   .   ');
      assert.isFalse(result);

      result = utils.isIntegerValue('10.1');
      assert.isFalse(result);

      result = utils.isIntegerValue('0.1');
      assert.isFalse(result);

      result = utils.isIntegerValue(undefined);
      assert.isFalse(result);

      result = utils.isIntegerValue(null);
      assert.isFalse(result);

      result = utils.isIntegerValue(true);
      assert.isFalse(result);

      result = utils.isIntegerValue(false);
      assert.isFalse(result);

      result = utils.isIntegerValue('0.1');
      assert.isFalse(result);

      result = utils.isIntegerValue(['a', 'b', 'c']);
      assert.isFalse(result);

      result = utils.isIntegerValue([1, 2, 3]);
      assert.isFalse(result);

      result = utils.isIntegerValue(['string', 2, false]);
      assert.isFalse(result);

      result = utils.isIntegerValue({ firstStringValue: 'a', secondStringValue: 'b', thirdStringValue: 'c' });
      assert.isFalse(result);

      result = utils.isIntegerValue({ firstNumberValue: 1, secondNumberValue: 2, thirdNumberValue: 3 });
      assert.isFalse(result);

      result = utils.isIntegerValue({ stringValue: 'string', numberValue: 2, booleanValue: false });
      assert.isFalse(result);

      result = utils.isIntegerValue('10abc');
      assert.isFalse(result);

      result = utils.isIntegerValue('10 abc');
      assert.isFalse(result);

      result = utils.isIntegerValue('abc10');
      assert.isFalse(result);

      // Busts MAX_SAFE_INTEGER
      result = utils.isIntegerValue(9007199254740992);
      assert.isFalse(result);

      result = utils.isIntegerValue('9007199254740992');
      assert.isFalse(result);

      // Busts MIN_SAFE_INTEGER
      result = utils.isIntegerValue(-9007199254740992);
      assert.isFalse(result);

      result = utils.isIntegerValue('-9007199254740992');
      assert.isFalse(result);
    });

    it('Negative values are accepted', () => {
      let result: boolean = utils.isIntegerValue(0, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(1, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(10.0, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(10, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('10', false);
      assert.isTrue(result);

      result = utils.isIntegerValue(' 10', false);
      assert.isTrue(result);

      result = utils.isIntegerValue('10 ', false);
      assert.isTrue(result);

      result = utils.isIntegerValue('10.0', false);
      assert.isTrue(result);

      result = utils.isIntegerValue('0', false);
      assert.isTrue(result);

      result = utils.isIntegerValue('1', false);
      assert.isTrue(result);

      result = utils.isIntegerValue(-1, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10.0, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('-10', false);
      assert.isTrue(result);

      result = utils.isIntegerValue(' -10', false);
      assert.isTrue(result);

      result = utils.isIntegerValue('-10 ', false);
      assert.isTrue(result);
    });

    it('Negative values are refused', () => {
      let result: boolean = utils.isIntegerValue(0, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(1, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(10.0, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(10, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('10', true);
      assert.isTrue(result);

      result = utils.isIntegerValue(' 10', true);
      assert.isTrue(result);

      result = utils.isIntegerValue('10 ', true);
      assert.isTrue(result);

      result = utils.isIntegerValue('10.0', true);
      assert.isTrue(result);

      result = utils.isIntegerValue('0', true);
      assert.isTrue(result);

      result = utils.isIntegerValue('1', true);
      assert.isTrue(result);

      result = utils.isIntegerValue(-1, true);
      assert.isFalse(result);

      result = utils.isIntegerValue(-10.0, true);
      assert.isFalse(result);

      result = utils.isIntegerValue(-10, true);
      assert.isFalse(result);

      result = utils.isIntegerValue('-10', true);
      assert.isFalse(result);

      result = utils.isIntegerValue(' -10', true);
      assert.isFalse(result);

      result = utils.isIntegerValue('-10 ', true);
      assert.isFalse(result);
    });

    it('Zero is included', () => {
      let result: boolean = utils.isIntegerValue(0, undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(1, undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(10.0, undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(10, undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('10', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(' 10', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('10 ', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('10.0', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('0', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('1', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(-1, undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10.0, undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10, undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('-10', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue(' -10', undefined, true);
      assert.isTrue(result);

      result = utils.isIntegerValue('-10 ', undefined, true);
      assert.isTrue(result);
    });

    it('Zero is excluded', () => {
      let result: boolean = utils.isIntegerValue(0, undefined, false);
      assert.isFalse(result);

      result = utils.isIntegerValue(1, undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(10.0, undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(10, undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('10', undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(' 10', undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('10 ', undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('10.0', undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('0', undefined, false);
      assert.isFalse(result);

      result = utils.isIntegerValue('1', undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(-1, undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10.0, undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(-10, undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('-10', undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue(' -10', undefined, false);
      assert.isTrue(result);

      result = utils.isIntegerValue('-10 ', undefined, false);
      assert.isTrue(result);
    });
  });

  // ==========================================
  // isNaNSafe()
  // ==========================================
  describe('isNaNSafe()', () => {
    it('Valid numbers', () => {
      let result: boolean = utils.isNaNSafe(0);
      assert.isFalse(result);

      result = utils.isNaNSafe(-0);
      assert.isFalse(result);

      result = utils.isNaNSafe(-1);
      assert.isFalse(result);

      result = utils.isNaNSafe(-1.123);
      assert.isFalse(result);

      result = utils.isNaNSafe(1);
      assert.isFalse(result);

      result = utils.isNaNSafe(1.123);
      assert.isFalse(result);
    });

    it('Invalid numbers', () => {
      let result: boolean = utils.isNaNSafe(null);
      assert.isTrue(result);

      result = utils.isNaNSafe(undefined);
      assert.isTrue(result);

      result = utils.isNaNSafe('');
      assert.isTrue(result);

      result = utils.isNaNSafe(' ');
      assert.isTrue(result);

      result = utils.isNaNSafe('abc');
      assert.isTrue(result);

      result = utils.isNaNSafe('123abc');
      assert.isTrue(result);

      result = utils.isNaNSafe('12.3abc');
      assert.isTrue(result);

      result = utils.isNaNSafe(true);
      assert.isTrue(result);

      result = utils.isNaNSafe(false);
      assert.isTrue(result);

      result = utils.isNaNSafe({});
      assert.isTrue(result);

      result = utils.isNaNSafe([]);
      assert.isTrue(result);
    });
  });

  // ==========================================
  // sleep()
  // ==========================================
  describe('sleep()', () => {
    it("The 'sleep()' function await correctly", async () => {
      const start = new Date().getTime();
      await utils.sleep(500);
      const end = new Date().getTime();
      assert.isTrue(end - start > 450);
    });
  });

  // ==========================================
  // isSafeToDelete()
  // ==========================================
  describe('isSafeToDelete()', () => {
    const utilsObj: Utils = new Utils();

    it('Safe paths', async () => {
      assert.isTrue(utilsObj.isSafeToDelete('/toto/titi'));
      assert.isTrue(utilsObj.isSafeToDelete('/toto/titi.txt'));
      assert.isTrue(utilsObj.isSafeToDelete('/toto/.titi'));
      assert.isTrue(utilsObj.isSafeToDelete('/toto/titi/tutu'));
      assert.isTrue(utilsObj.isSafeToDelete('/toto/titi/tutu.txt'));
      assert.isTrue(utilsObj.isSafeToDelete('C:\\toto\\titi'));
      assert.isTrue(utilsObj.isSafeToDelete('C:\\toto\\titi.txt'));
      assert.isTrue(utilsObj.isSafeToDelete('C:\\toto\\titi\\tutu'));
      assert.isTrue(utilsObj.isSafeToDelete('C:\\toto\\titi\\tutu.txt'));
      assert.isTrue(utilsObj.isSafeToDelete('C:/toto/titi'));
      assert.isTrue(utilsObj.isSafeToDelete('C:/toto/titi.txt'));
      assert.isTrue(utilsObj.isSafeToDelete('C:/toto/.titi'));
      assert.isTrue(utilsObj.isSafeToDelete('C:/toto/titi/tutu'));
      assert.isTrue(utilsObj.isSafeToDelete('C:/toto/titi/tutu.txt'));
    });

    it('Unsafe paths', async () => {
      assert.isFalse(utilsObj.isSafeToDelete(undefined));
      assert.isFalse(utilsObj.isSafeToDelete(null));
      assert.isFalse(utilsObj.isSafeToDelete(''));
      assert.isFalse(utilsObj.isSafeToDelete(' '));
      assert.isFalse(utilsObj.isSafeToDelete('/'));
      assert.isFalse(utilsObj.isSafeToDelete('/ '));
      assert.isFalse(utilsObj.isSafeToDelete(' / '));
      assert.isFalse(utilsObj.isSafeToDelete(' // '));
      assert.isFalse(utilsObj.isSafeToDelete(' / / '));
      assert.isFalse(utilsObj.isSafeToDelete('//'));
      assert.isFalse(utilsObj.isSafeToDelete('///'));
      assert.isFalse(utilsObj.isSafeToDelete('//////'));
      assert.isFalse(utilsObj.isSafeToDelete('//\n'));
      assert.isFalse(utilsObj.isSafeToDelete('//\r'));
      assert.isFalse(utilsObj.isSafeToDelete('//\t'));
      assert.isFalse(utilsObj.isSafeToDelete('/titi'));
      assert.isFalse(utilsObj.isSafeToDelete('//titi'));
      assert.isFalse(utilsObj.isSafeToDelete('/////titi'));
      assert.isFalse(utilsObj.isSafeToDelete('/////titi///////'));
      assert.isFalse(utilsObj.isSafeToDelete('/titi.txt'));
      assert.isFalse(utilsObj.isSafeToDelete('\\'));
      assert.isFalse(utilsObj.isSafeToDelete('\\\\'));
      assert.isFalse(utilsObj.isSafeToDelete('\\\\ '));
      assert.isFalse(utilsObj.isSafeToDelete('C'));
      assert.isFalse(utilsObj.isSafeToDelete('C:'));
      assert.isFalse(utilsObj.isSafeToDelete('C:\\'));
      assert.isFalse(utilsObj.isSafeToDelete('C:\\ '));
      assert.isFalse(utilsObj.isSafeToDelete('C:\\titi'));
      assert.isFalse(utilsObj.isSafeToDelete('C:\\titi.txt'));
      assert.isFalse(utilsObj.isSafeToDelete('C://'));
      assert.isFalse(utilsObj.isSafeToDelete('C://titi'));
      assert.isFalse(utilsObj.isSafeToDelete('C://titi.txt'));
      assert.isFalse(utilsObj.isSafeToDelete('C:////titi'));
      assert.isFalse(utilsObj.isSafeToDelete('\r'));
      assert.isFalse(utilsObj.isSafeToDelete('\n'));
      assert.isFalse(utilsObj.isSafeToDelete('\t'));
    });
  });

  // ==========================================
  // isDir()
  // ==========================================
  describe('isDir()', () => {
    before(async () => {
      if (!fs.existsSync(constants.testDataDirPath)) {
        fs.mkdirSync(constants.testDataDirPath);
      }
    });

    it('Is dir', () => {
      const thePath = constants.testDataDirPath + '/' + uuid();
      assert.isFalse(utils.isDir(thePath));
      assert.isFalse(fs.existsSync(thePath));

      fs.mkdirSync(thePath);
      assert.isTrue(utils.isDir(thePath));
      assert.isTrue(fs.existsSync(thePath));
    });

    it('Is a file', () => {
      const thePath = constants.testDataDirPath + '/' + uuid();
      assert.isFalse(utils.isDir(thePath));
      assert.isFalse(fs.existsSync(thePath));

      fs.createFileSync(thePath);
      assert.isTrue(fs.existsSync(thePath));
      assert.isFalse(utils.isDir(thePath));
    });
  });

  // ==========================================
  // isDirEmpty()
  // ==========================================
  describe('isDirEmpty()', () => {
    it('Is dir - empty', () => {
      const thePath = constants.testDataDirPath + '/' + uuid();
      assert.isTrue(utils.isDirEmpty(thePath));

      fs.mkdirSync(thePath);
      assert.isTrue(utils.isDirEmpty(thePath));
    });

    it('Is dir - not empty', () => {
      const thePath = constants.testDataDirPath + '/' + uuid();
      fs.mkdirSync(thePath);

      fs.createFileSync(thePath + '/test');
      assert.isFalse(utils.isDirEmpty(thePath));
    });

    it('Is a file', () => {
      const thePath = constants.testDataDirPath + '/' + uuid();
      assert.isTrue(utils.isDirEmpty(thePath));

      fs.createFileSync(thePath);
      assert.isFalse(utils.isDirEmpty(thePath));
    });
  });

  // ==========================================
  // deleteFile()
  // ==========================================
  describe('deleteFile()', async () => {
    it('Safe file', async () => {
      const tempFilePath = constants.testDataDirPath + '/tmp' + new Date().getTime();
      assert.isFalse(fs.existsSync(tempFilePath));
      fs.createFileSync(tempFilePath);

      assert.isTrue(fs.existsSync(tempFilePath));

      await utils.deleteFile(tempFilePath);

      assert.isFalse(fs.existsSync(tempFilePath));
    });

    it('Unsafe file', async () => {
      // root file
      const tempFilePath = '/tmp' + new Date().getTime();
      assert.isFalse(fs.existsSync(tempFilePath));

      let error = false;
      try {
        await utils.deleteFile(tempFilePath);
      } catch (err) {
        error = true;
      }
      assert.isTrue(error);
    });
  });

  // ==========================================
  // deleteDir()
  // ==========================================
  describe('deleteDir()', async () => {
    it('Safe dir', async () => {
      const tempFilePath = constants.testDataDirPath + '/tmp' + new Date().getTime();
      assert.isFalse(fs.existsSync(tempFilePath));

      fs.mkdirSync(tempFilePath);
      fs.createFileSync(tempFilePath + '/someFile');
      fs.mkdirSync(tempFilePath + '/subDir');
      fs.createFileSync(tempFilePath + '/subDir/.anotherFile');

      assert.isTrue(fs.existsSync(tempFilePath));

      await utils.deleteDir(tempFilePath);

      assert.isFalse(fs.existsSync(tempFilePath));
    });

    it('Unsafe dir', async () => {
      const tempFilePath = '/tmp' + new Date().getTime();
      assert.isFalse(fs.existsSync(tempFilePath));

      let error = false;
      try {
        await utils.deleteDir(tempFilePath);
      } catch (err) {
        error = true;
      }
      assert.isTrue(error);
    });
  });

  // ==========================================
  // clearDir()
  // ==========================================
  describe('clearDir()', async () => {
    it('Safe dir', async () => {
      if (!fs.existsSync(constants.testDataDirPath)) {
        fs.mkdirSync(constants.testDataDirPath);
      }
      const tempFilePath = constants.testDataDirPath + '/tmp' + new Date().getTime();
      assert.isFalse(fs.existsSync(tempFilePath));

      fs.mkdirSync(tempFilePath);

      try {
        fs.createFileSync(tempFilePath + '/someFile');
        fs.createFileSync(tempFilePath + '/.someFile2');
        fs.mkdirSync(tempFilePath + '/subDir');
        fs.createFileSync(tempFilePath + '/subDir/.anotherFile');

        assert.isTrue(fs.existsSync(tempFilePath));
        assert.isTrue(fs.existsSync(tempFilePath + '/someFile'));
        assert.isTrue(fs.existsSync(tempFilePath + '/.someFile2'));
        assert.isTrue(fs.existsSync(tempFilePath + '/subDir'));

        await utils.clearDir(tempFilePath);

        assert.isTrue(fs.existsSync(tempFilePath));
        assert.isFalse(fs.existsSync(tempFilePath + '/someFile'));
        assert.isFalse(fs.existsSync(tempFilePath + '/.someFile2'));
        assert.isFalse(fs.existsSync(tempFilePath + '/subDir'));
      } finally {
        await utils.deleteDir(tempFilePath);
      }
    });

    it('Unsafe dir', async () => {
      const tempFilePath = '/tmp' + new Date().getTime();
      assert.isFalse(fs.existsSync(tempFilePath));

      let error = false;
      try {
        await utils.clearDir(tempFilePath);
      } catch (err) {
        error = true;
      }
      assert.isTrue(error);
    });
  });

  // ==========================================
  // getDefinedOrNull()
  // ==========================================
  describe('getDefinedOrNull()', async () => {
    it('Defined stays untouches', async () => {
      let res = utils.getDefinedOrNull('abc');
      assert.strictEqual(res, 'abc');

      res = utils.getDefinedOrNull('');
      assert.strictEqual(res, '');

      res = utils.getDefinedOrNull(123);
      assert.strictEqual(res, 123);

      res = utils.getDefinedOrNull({});
      assert.deepEqual(res, {});

      res = utils.getDefinedOrNull([]);
      assert.deepEqual(res, []);
    });

    it('Null stays Null', async () => {
      const res = utils.getDefinedOrNull(null);
      assert.strictEqual(res, null);
    });

    it('Undefined becomes Null', async () => {
      const res = utils.getDefinedOrNull(undefined);
      assert.strictEqual(res, null);
    });
  });

  describe('findFreePort', () => {
    it('', async () => {
      const port: number = await utils.findFreePort();
      assert.isOk(port);
      assert.isNumber(port);
    });
  });

  describe('isValidDate', () => {
    it('valid date - Date', async () => {
      assert.isTrue(utils.isValidDate(new Date()));
    });
    it('valid date - Date from valid string', async () => {
      const date = new Date('2011-04-11T10:20:30Z');
      assert.isTrue(utils.isValidDate(date));
    });
    it('invalid date - Date from invalid string', async () => {
      const date = new Date('toto');
      assert.isFalse(utils.isValidDate(date));
    });
    it('invalid date - various', async () => {
      for (const date of [[], 123, `toto`, {}, ``, ` `, null, undefined] as any) {
        assert.isFalse(utils.isValidDate(date));
      }
    });
  });

  describe('dateTransformer', () => {
    it('valid date as Date', async () => {
      const date = utils.dateTransformer(new Date());
      assert.isOk(date);
      assert.isTrue(utils.isValidDate(date));
    });

    it('valid date as string', async () => {
      let date = utils.dateTransformer('2011-04-11T10:20:30Z');
      assert.isOk(date);
      assert.isTrue(utils.isValidDate(date));

      date = utils.dateTransformer('2011-04-11');
      assert.isOk(date);
      assert.isTrue(utils.isValidDate(date));
    });

    it('empty date', async () => {
      for (const dateLike of [null, undefined] as any) {
        const date = utils.dateTransformer(dateLike);
        assert.isNull(date);
      }
    });

    it('invalid date', async () => {
      for (const dateLike of [``, ` `, 123, true, [], {}, 'toto'] as any) {
        const date = utils.dateTransformer(dateLike);
        assert.isOk(date);
        assert.isFalse(utils.isValidDate(date));
      }
    });
  });

  describe('throwNotManaged', () => {
    const tmpRepPath = constants.testDataDirPath + '/test_throwNotManaged';
    before(async () => {
      if (!fs.existsSync(constants.testDataDirPath)) {
        fs.mkdirSync(constants.testDataDirPath);
      }

      if (fs.existsSync(tmpRepPath)) {
        fs.removeSync(tmpRepPath);
      }
      fs.mkdirSync(tmpRepPath);
    });

    after(async () => {
      fs.removeSync(constants.testDataDirPath);
    });

    it('compile', async function() {
      // May take some time to compile...
      this.timeout(7000);

      const fileName = uuid();
      const filesPathPrefix = tmpRepPath + '/' + fileName;
      const tsFilePath = filesPathPrefix + '.ts';

      const content = fs.readFileSync(constants.libRoot + '/tests-resources/throwNotManagedSuccess.txt', {
        encoding: 'UTF-8'
      });
      fs.writeFileSync(tsFilePath, content);

      await utils.tsc([tsFilePath]);

      const distRepPath = constants.libRoot + '/dist/test-data/test_throwNotManaged';
      assert.isTrue(fs.existsSync(distRepPath + '/' + fileName + '.js'));
      fs.removeSync(distRepPath);
    });

    it("doesn't compile", async function() {
      // May take some time to compile...
      this.timeout(7000);

      if (fs.existsSync(tmpRepPath)) {
        fs.removeSync(tmpRepPath);
      }
      fs.mkdirSync(tmpRepPath);

      const fileName = uuid();
      const filesPathPrefix = tmpRepPath + '/' + fileName;
      const tsFilePath = filesPathPrefix + '.ts';

      const content = fs.readFileSync(constants.libRoot + '/tests-resources/throwNotManagedFail.txt', {
        encoding: 'UTF-8'
      });
      fs.writeFileSync(tsFilePath, content);

      try {
        await utils.tsc([tsFilePath]);
        assert.fail();
      } catch (err) {
        // ok
      }
    });

    it('throws error', async () => {
      try {
        utils.throwNotManaged('my message', 'oups' as never);
        assert.fail();
      } catch (err) {
        /* ok */
      }
    });
  });

  // ==========================================
  // isObjectStrict()
  // ==========================================
  describe('isObjectStrict()', () => {
    it('is object', () => {
      for (const value of [{}, new Object()] as any) {
        assert.isTrue(utils.isObjectStrict(value));
      }
    });
    it('is not object', () => {
      for (const value of [
        [],
        [123],
        // tslint:disable-next-line:prefer-array-literal
        new Array(),
        null,
        undefined,
        '',
        ' ',
        123,
        ,
        new Date(),
        () => {
          /* ok */
        }
      ] as any) {
        assert.isFalse(utils.isObjectStrict(value));
      }
    });
  });

  // ==========================================
  // arrayContainsObjectWithKeyEqualsTo()
  // ==========================================
  describe('arrayContainsObjectWithKeyEqualsTo()', () => {
    it('contains string', () => {
      const array = [
        {
          aaa: 123,
          myKey: 'myValue'
        }
      ];
      assert.isTrue(utils.arrayContainsObjectWithKeyEqualsTo(array, 'myKey', 'myValue'));
    });

    it('contains number', () => {
      const array = [
        {
          aaa: 123,
          myKey: 12345
        }
      ];
      assert.isTrue(utils.arrayContainsObjectWithKeyEqualsTo(array, 'myKey', 12345));
    });

    it('contains date', () => {
      const someDate = new Date();
      const array = [
        {
          aaa: 123,
          myKey: someDate
        }
      ];
      assert.isTrue(utils.arrayContainsObjectWithKeyEqualsTo(array, 'myKey', someDate));
    });

    it('contains complex object', () => {
      const someDate = new Date();

      const obj = {
        titi: 123,
        tutu: someDate,
        toto: [
          123,
          '',
          null,
          {
            juju: 123.45
          }
        ],
        tata: undefined as number
      };

      const array = [
        {
          aaa: 123,
          myKey: obj
        }
      ];
      assert.isTrue(utils.arrayContainsObjectWithKeyEqualsTo(array, 'myKey', obj));
    });

    it(`doesn't contains - no key match`, () => {
      const someDate = new Date();

      const obj = {
        titi: 123,
        tutu: someDate,
        toto: [
          123,
          '',
          null,
          {
            juju: 123.45
          }
        ],
        tata: undefined as number
      };

      const array = [
        {
          aaa: 123,
          nope: obj
        }
      ];
      assert.isFalse(utils.arrayContainsObjectWithKeyEqualsTo(array, 'myKey', obj));
    });

    it(`doesn't contains - strict equality`, () => {
      const someDate = new Date();

      const obj = {
        titi: 123,
        tutu: someDate,
        toto: [
          123,
          '',
          null,
          {
            juju: 123.45
          }
        ],
        tata: undefined as number
      };

      const array = [
        {
          aaa: 123,
          myKey: obj
        }
      ];
      assert.isFalse(
        utils.arrayContainsObjectWithKeyEqualsTo(array, 'myKey', {
          titi: '123', // as string!
          tutu: someDate,
          toto: [
            123,
            '',
            null,
            {
              juju: 123.45
            }
          ],
          tata: undefined as number
        })
      );
    });

    // ==========================================
    // range()
    // ==========================================
    describe('range()', () => {
      it('two positive', () => {
        const range = utils.range(3, 6);
        assert.deepEqual(range, [3, 4, 5, 6]);
      });

      it('first negative', () => {
        const range = utils.range(-1, 2);
        assert.deepEqual(range, [-1, 0, 1, 2]);
      });

      it('two negative', () => {
        const range = utils.range(-3, -1);
        assert.deepEqual(range, [-3, -2, -1]);
      });

      it('first greater than second', () => {
        let error;
        try {
          utils.range(3, 1);
        } catch (err) {
          error = err;
        }
        if (!error) {
          assert.fail();
        }
      });

      it('float numbers', () => {
        let error;
        try {
          utils.range(1.0, 3.5);
        } catch (err) {
          error = err;
        }
        if (!error) {
          assert.fail();
        }
      });
    });
  });

  // ==========================================
  // exec()
  // ==========================================
  describe('exec()', () => {
    const dummyJs = `dist/tests-resources/exec/execTest`;

    it('default', async () => {
      const exitCode = await utils.exec(`node`, [dummyJs]);
      assert.deepEqual(exitCode, 0);
    });

    it('bin missing', async () => {
      for (const bin of [undefined, null, '']) {
        try {
          await utils.exec(bin);
        } catch (err) {
          assert.isTrue(err instanceof ExecError);
          assert.isNumber(err.exitCode);
          assert.notDeepEqual(err.exitCode, 0);
        }
      }
    });

    it('invalid bin', async () => {
      try {
        await utils.exec(`_NOPE`);
      } catch (err) {
        assert.isTrue(err instanceof ExecError);
        assert.isNumber(err.exitCode);
        assert.notDeepEqual(err.exitCode, 0);
      }
    });

    it('file arg error', async () => {
      try {
        await utils.exec(`node`, [`dist/_NOPE`]);
      } catch (err) {
        assert.isTrue(err instanceof ExecError);
        assert.isNumber(err.exitCode);
        assert.notDeepEqual(err.exitCode, 0);
      }
    });

    it('error', async () => {
      let error;
      try {
        await utils.exec(`node`, [dummyJs, `error`]);
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }

      assert.isTrue(error instanceof ExecError);
      assert.isNumber(error.exitCode);
      assert.notDeepEqual(error.exitCode, 0);
    });

    it('exit code explicitly 0', async () => {
      const exitCode = await utils.exec(`node`, [dummyJs, `customExitCode`, `0`]);
      assert.deepEqual(exitCode, 0);
    });

    it('custom exit code - error', async () => {
      let error;
      try {
        await utils.exec(`node`, [dummyJs, `customExitCode`, `123`]);
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }

      assert.isTrue(error instanceof ExecError);
      assert.isNumber(error.exitCode);
      assert.deepEqual(error.exitCode, 123);
    });

    it('custom exit code - success', async () => {
      const exitCode = await utils.exec(`node`, [dummyJs, `customExitCode`, `123`], {
        successExitCodes: 123
      });
      assert.deepEqual(exitCode, 123);
    });

    it('custom exit code - multiple', async () => {
      let exitCode = await utils.exec(`node`, [dummyJs, `customExitCode`, `123`], {
        successExitCodes: [0, 123]
      });
      assert.deepEqual(exitCode, 123);

      exitCode = await utils.exec(`node`, [dummyJs, `success`], {
        successExitCodes: [0, 123]
      });
      assert.deepEqual(exitCode, 0);

      let error;
      try {
        await utils.exec(`node`, [dummyJs, `customExitCode`, `1`], {
          successExitCodes: [0, 123]
        });
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }

      assert.isTrue(error instanceof ExecError);
      assert.isNumber(error.exitCode);
      assert.deepEqual(error.exitCode, 1);
    });

    it('output handler', async () => {
      let currentOut = '';
      let currentErr = '';
      let execOut = '';
      let execErr = '';

      const stdOutOriginal = process.stdout.write;
      const stdErrOriginal = process.stderr.write;

      try {
        process.stdout.write = (chunk: string): boolean => {
          currentOut += chunk.toString();
          return true;
        };

        process.stderr.write = (chunk: any): boolean => {
          currentErr += chunk.toString();
          return true;
        };

        await utils.exec(`node`, [dummyJs], {
          outputHandler: (stdoutOutput: string, stderrOutput: string): void => {
            execOut += stdoutOutput ? stdoutOutput : '';
            execErr += stderrOutput ? stderrOutput : '';
          }
        });

        assert.isTrue(execOut.includes(`in dummy - info`));
        assert.isFalse(execOut.includes(`in dummy - error`));
        assert.isFalse(execErr.includes(`in dummy - info`));
        assert.isTrue(execErr.includes(`in dummy - error`));

        assert.isTrue(currentOut.includes(`in dummy - info`));
        assert.isFalse(currentOut.includes(`in dummy - error`));
        assert.isFalse(currentErr.includes(`in dummy - info`));
        assert.isTrue(currentErr.includes(`in dummy - error`));
      } finally {
        process.stdout.write = stdOutOriginal;
        process.stderr.write = stdErrOriginal;
      }
    });

    it('output handler + disableConsoleOutputs', async () => {
      let currentOut = '';
      let currentErr = '';
      let execOut = '';
      let execErr = '';

      const stdOutOriginal = process.stdout.write;
      const stdErrOriginal = process.stderr.write;

      try {
        process.stdout.write = (chunk: string): boolean => {
          currentOut += chunk.toString();
          return true;
        };

        process.stderr.write = (chunk: any): boolean => {
          currentErr += chunk.toString();
          return true;
        };

        await utils.exec(`node`, [dummyJs], {
          outputHandler: (stdoutOutput: string, stderrOutput: string): void => {
            execOut += stdoutOutput ? stdoutOutput : '';
            execErr += stderrOutput ? stderrOutput : '';
          },
          disableConsoleOutputs: true
        });

        assert.isTrue(execOut.includes(`in dummy - info`));
        assert.isFalse(execOut.includes(`in dummy - error`));
        assert.isFalse(execErr.includes(`in dummy - info`));
        assert.isTrue(execErr.includes(`in dummy - error`));

        assert.deepEqual(currentOut, '');
        assert.deepEqual(currentErr, '');
      } finally {
        process.stdout.write = stdOutOriginal;
        process.stderr.write = stdErrOriginal;
      }
    });

    it('execPromisified deprecated but still working', async () => {
      let execOut = '';
      let execErr = '';

      const exitCode = await utils.execPromisified(
        `node`,
        [dummyJs],
        (stdoutOutput: string, stderrOutput: string): void => {
          execOut += stdoutOutput ? stdoutOutput : '';
          execErr += stderrOutput ? stderrOutput : '';
        }
      );
      assert.isUndefined(exitCode); // no exit code

      assert.isTrue(execOut.includes(`in dummy - info`));
      assert.isFalse(execOut.includes(`in dummy - error`));
      assert.isFalse(execErr.includes(`in dummy - info`));
      assert.isTrue(execErr.includes(`in dummy - error`));
    });

    it('execPromisified deprecated but still working - error', async () => {
      let error;
      try {
        await utils.execPromisified(`node`, [dummyJs, `error`]);
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }
    });
  });
});
