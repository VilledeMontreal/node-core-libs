import { assert } from 'chai';
import * as _ from 'lodash';
import { getValueDescriptionWithType } from '.';
import {
  filter,
  getCartesianProduct,
  isCollection,
  isCompatible,
  isEmpty,
  isMatching,
  removeEmptyValues,
  removeMissingValues,
  toDictionary
} from './collectionUtils';

export const EMPTY_STRING = '';
export const EMPTY_ARRAY: any[] = [];
Object.freeze(EMPTY_ARRAY);
export const EMPTY_OBJECT: any = {};
Object.freeze(EMPTY_OBJECT);
export const EMPTY_FUNCTION = _.noop;
Object.freeze(EMPTY_FUNCTION);
export const EMPTY_PATTERN = /^$/;
Object.freeze(EMPTY_PATTERN);

const EMPTY_MAP = new Map<any, any>();
Object.freeze(EMPTY_MAP);

const EMPTY_SET = new Set<any>();
Object.freeze(EMPTY_SET);

export const EMPTY_VALUES = [undefined, null, EMPTY_STRING, EMPTY_ARRAY, EMPTY_OBJECT, EMPTY_MAP, EMPTY_SET];
Object.freeze(EMPTY_VALUES);

const EMPTY_VALUES_MAP = toDictionary(EMPTY_VALUES, getValueDescriptionWithType);
Object.freeze(EMPTY_VALUES_MAP);

const NOT_EMPTY_MAP = new Map<any, any>();
NOT_EMPTY_MAP.set(123, 'ABC');
Object.freeze(NOT_EMPTY_MAP);

const NOT_EMPTY_SET = new Set<any>();
NOT_EMPTY_SET.add(123);
Object.freeze(NOT_EMPTY_SET);

export const NOT_EMPTY_VALUES = [
  true,
  false,
  NaN,
  123,
  Infinity,
  '🍺',
  EMPTY_FUNCTION,
  { id: 1 },
  ['🍕'],
  EMPTY_PATTERN,
  new Date(),
  new Error(),
  Number(123),
  NOT_EMPTY_MAP,
  NOT_EMPTY_SET
];
Object.freeze(NOT_EMPTY_VALUES);

const NOT_EMPTY_VALUES_MAP = toDictionary(NOT_EMPTY_VALUES, getValueDescriptionWithType);
Object.freeze(NOT_EMPTY_VALUES_MAP);

export const NOT_MISSING_VALUES = _.concat(_.reject(EMPTY_VALUES, _.isNil), NOT_EMPTY_VALUES);
Object.freeze(NOT_MISSING_VALUES);

const NOT_MISSING_VALUES_MAP = toDictionary(NOT_MISSING_VALUES, getValueDescriptionWithType);
Object.freeze(NOT_MISSING_VALUES_MAP);

describe('Collection Utility', () => {
  describe('#isEmpty', () => {
    EMPTY_VALUES.forEach(value => {
      it(`should return \`true\` for ${getValueDescriptionWithType(value)}`, () => {
        assert.isTrue(isEmpty(value));
      });
    });
    NOT_EMPTY_VALUES.forEach(value => {
      it(`should return \`false\` for ${getValueDescriptionWithType(value)}`, () => {
        assert.isFalse(isEmpty(value));
      });
    });
  });

  describe('#isCollection', () => {
    assert.isTrue(isCollection(EMPTY_OBJECT));
    assert.isTrue(isCollection({ id: 1 }));
    assert.isTrue(isCollection(EMPTY_ARRAY));
    assert.isTrue(isCollection(['🍕']));
    assert.isTrue(isCollection(EMPTY_MAP));
    assert.isTrue(isCollection(NOT_EMPTY_MAP));
    assert.isTrue(isCollection(EMPTY_SET));
    assert.isTrue(isCollection(NOT_EMPTY_SET));
  });

  describe('#removeEmptyValues', () => {
    it('should remove empty values from arrays', () => {
      const values = _.concat([], EMPTY_VALUES, NOT_EMPTY_VALUES);
      const result = removeEmptyValues(values);
      assert.deepStrictEqual(result, NOT_EMPTY_VALUES);
    });

    it('should remove empty values from objects', () => {
      const values = _.merge({}, EMPTY_VALUES_MAP, NOT_EMPTY_VALUES_MAP);
      const result = removeEmptyValues(values);
      assert.deepStrictEqual(result, NOT_EMPTY_VALUES_MAP);
    });
  });

  describe('#removeMissingValues', () => {
    it('should remove missing values from arrays', () => {
      const values = _.concat([], EMPTY_VALUES, NOT_EMPTY_VALUES);
      const result = removeMissingValues(values);
      assert.deepStrictEqual(result, NOT_MISSING_VALUES);
    });

    it('should remove missing values from objects', () => {
      const values = _.merge({}, EMPTY_VALUES_MAP, NOT_EMPTY_VALUES_MAP);
      const result = removeMissingValues(values);
      assert.deepStrictEqual(result, NOT_MISSING_VALUES_MAP);
    });
  });

  describe('#filter', () => {
    it('should be no-op if no filter is provided', () => {
      const values = _.merge({}, EMPTY_VALUES_MAP, NOT_EMPTY_VALUES_MAP);
      assert.deepStrictEqual(filter(values, null), values);
    });
  });

  describe('#getCartesianProduct', () => {
    it('should return expected value', () => {
      const valueSet1 = ['A', 1, true, null, EMPTY_FUNCTION, EMPTY_ARRAY];
      const valueSet2 = [EMPTY_PATTERN, NaN, false, undefined, EMPTY_OBJECT];

      const result = getCartesianProduct(valueSet1, valueSet2);

      // prettier-ignore
      const expectedResult = [
        ['A', EMPTY_PATTERN], ['A', NaN], ['A', false], ['A', undefined], ['A', EMPTY_OBJECT],
        [1, EMPTY_PATTERN], [1, NaN], [1, false], [1, undefined], [1, EMPTY_OBJECT],
        [true, EMPTY_PATTERN], [true, NaN], [true, false], [true, undefined], [true, EMPTY_OBJECT],
        [null, EMPTY_PATTERN], [null, NaN], [null, false], [null, undefined], [null, EMPTY_OBJECT],
        [EMPTY_FUNCTION, EMPTY_PATTERN], [EMPTY_FUNCTION, NaN], [EMPTY_FUNCTION, false], [EMPTY_FUNCTION, undefined], [EMPTY_FUNCTION, EMPTY_OBJECT],
        [EMPTY_ARRAY, EMPTY_PATTERN], [EMPTY_ARRAY, NaN], [EMPTY_ARRAY, false], [EMPTY_ARRAY, undefined], [EMPTY_ARRAY, EMPTY_OBJECT]
      ];

      assert.deepStrictEqual(result, expectedResult);
    });
  });

  describe('Utility functions', () => {
    describe('#isMatching', () => {
      it('should behave properly', () => {
        assert.isTrue(isMatching({ A: 1, B: 2, C: 3 }, { A: 1, B: 2 }));
        assert.isFalse(isMatching({ A: 1, B: 2 }, { A: 1, B: 2, C: 3 }));
        assert.isTrue(isMatching({ A: 1, B: 2 }, { A: '???', B: 2, C: 3 }, ['B']));
      });
    });

    describe('#isCompatible', () => {
      it('should support fixed values', () => {
        assert.isTrue(isCompatible({ A: 1, B: 2, C: 3 }, { A: 1, B: 2 }));
        assert.isTrue(isCompatible({ A: 1, B: 2, C: 3 }, { A: 1, B: 2 }, ['A', 'B']));
        assert.isFalse(isCompatible({ A: 1, B: 2 }, { A: 1, B: 2, C: 3 }));
        assert.isFalse(isCompatible({ A: 1, B: 2 }, { A: '???', B: 2 }));
        assert.isTrue(isCompatible({ A: 1, B: 2 }, { A: 1, B: 2 }, ['C']));
        assert.isTrue(isCompatible({ A: 1, B: 2 }, { A: '???', B: 2, C: 3 }, ['B']));
        assert.isTrue(isCompatible({ A: 1, B: 2, C: 3 }, { A: '???', B: 2, C: 3 }, ['B', 'C']));
        const rule = (value: number) => value < 3;
        assert.isFalse(isCompatible({ A: 1, B: 2, C: 3 }, { A: rule, B: rule, C: rule }));
        assert.isTrue(isCompatible({ A: 0, B: 1, C: 2 }, { A: rule, B: rule, C: rule }));
        assert.isTrue(isCompatible({ A: 999, B: 2, C: 999 }, { A: rule, B: rule, C: rule }, ['B']));
      });

      it('should support compatibility rules', () => {
        assert.isTrue(isCompatible({ A: 1, B: 2, C: 3 }, { A: _.isNumber, C: 3 }));
        assert.isFalse(isCompatible({ A: 1, B: 2, C: 3 }, { B: _.isBoolean }));
        assert.isTrue(isCompatible({ A: 1, B: 2, C: 3 }, { D: _.isUndefined }));
      });
    });
  });
});
