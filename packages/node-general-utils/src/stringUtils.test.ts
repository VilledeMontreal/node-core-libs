import { assert } from 'chai';
import { deDuplicateChars, prefix, suffix, trimAll } from './stringUtils';

describe('String Utility', () => {
  describe('#prefix', () => {
    it('should work properly', () => {
      assert.strictEqual(prefix(undefined, 'A'), undefined);
      assert.strictEqual(prefix(null, 'A'), null);
      assert.strictEqual(prefix('BC', null), 'BC');
      assert.strictEqual(prefix('BC', undefined), 'BC');
      assert.strictEqual(prefix('BC', 'A'), 'ABC');
    });
  });

  describe('#suffix', () => {
    it('should work properly', () => {
      assert.strictEqual(suffix(undefined, 'C'), undefined);
      assert.strictEqual(suffix(null, 'C'), null);
      assert.strictEqual(suffix('AB', null), 'AB');
      assert.strictEqual(suffix('AB', undefined), 'AB');
      assert.strictEqual(suffix('AB', 'C'), 'ABC');
    });
  });

  describe('deDuplicateChars', () => {
    it('No trim', () => {
      assert.strictEqual(deDuplicateChars(null, ' ', '_'), null);
      assert.strictEqual(deDuplicateChars(undefined, ' ', '_'), undefined);
      assert.strictEqual(deDuplicateChars('a      b', null, '_'), 'a      b');
      assert.strictEqual(deDuplicateChars('a      b', undefined, '_'), 'a      b');
      assert.strictEqual(deDuplicateChars('a      b', '', '_'), 'a      b');
      assert.strictEqual(deDuplicateChars('a      b', ' ', null), 'a      b');
      assert.strictEqual(deDuplicateChars('a      b', ' ', undefined), 'a      b');

      assert.strictEqual(deDuplicateChars('  a      b  ', ' ', ' '), ' a b ');
      assert.strictEqual(deDuplicateChars('a      b', ' ', ''), 'ab');
      assert.strictEqual(deDuplicateChars('a   \\   b', ' \\', ''), 'ab');
      assert.strictEqual(deDuplicateChars('a   \\   b', ' \\', '\\'), 'a\\b');
      assert.strictEqual(deDuplicateChars('a      b', ' ', '_'), 'a_b');
      assert.strictEqual(
        deDuplicateChars(' \r\n   \t   a \r\n   \t  \n \t   b   \r\n   \t   ', ' \t\r\n', ' '),
        ' a b ',
      );
      assert.strictEqual(
        deDuplicateChars(' \r\n   \t   a \r\n   \t  \n \t   b   \r\n   \t   ', ' \t\r\n', ''),
        'ab',
      );
    });

    it('With trim', () => {
      assert.strictEqual(deDuplicateChars('  a      b  ', ' ', ' ', true), 'a b');
      assert.strictEqual(
        deDuplicateChars(
          ' \r\n   \t   a \r\n   \t  \n \t   b   \r\n   \t   ',
          ' \t\r\n',
          ' ',
          true,
        ),
        'a b',
      );
    });
  });

  describe('trimAll', () => {
    it('should work properly', () => {
      assert.strictEqual(trimAll(null), null);
      assert.strictEqual(trimAll(undefined), undefined);
      assert.strictEqual(trimAll(''), '');
      assert.strictEqual(trimAll(' '), '');
      assert.strictEqual(trimAll('     '), '');
      assert.strictEqual(trimAll('   \r\n \r    \t \n   \r\t \t'), '');
      assert.strictEqual(
        trimAll(
          '   \r\n \r    \t \n   \r\t \t  a    \r\n \r    \t \n   \r\t \tb   \r\n \r    \t \n   \r\t \t',
        ),
        'a b',
      );
    });
  });
});
