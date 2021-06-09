import * as _ from 'lodash';

// prettier-ignore
export const getCartesianProduct = (...vectors: any[]): any[] =>
  _.reduce(
    vectors,
    (accumulator, vector) => _.flatten(
      _.map(accumulator, product =>
        _.map(vector, value => product.concat([value]))
      )
    ),
    [[]] // accumulator, initially
  );

/**
 * Tells whether the provided value is or can be considered empty.
 *
 * Following types are always considered *NOT* empty: boolean, number, function, RegExp.
 *
 * @example
 * • isEmpty('') → true
 * • isEmpty('…') → false
 * • isEmpty({}) → true
 * • isEmpty([]) → true
 * • isEmpty(null) → true
 * • isEmpty(undefined) → true
 * • isEmpty(true) → false
 * • isEmpty(/^$/) → false
 *
 * @param collection Collection to remove the empty values from.
 * @param #removeEmptyValues
 */
// Rationale: Lodash's `#isEmpty` only deals with collections...
export function isEmpty(value: any) {
  // Easy cases:
  let result: boolean | undefined = value === undefined || value === null || value === '' || undefined;

  const valueType = typeof value;

  // Some types just can't be "empty":
  if (result === undefined) {
    // tslint:disable-next-line:cyclomatic-complexity
    if (
      valueType === 'boolean' ||
      valueType === 'number' ||
      valueType === 'function' ||
      value instanceof RegExp ||
      value instanceof Date ||
      value instanceof Error
    ) {
      result = false;
    }
  }

  // Case of collections - leverage `_.size`:
  if (result === undefined && isCollection(value)) {
    result = _.isEmpty(value);
  }

  // Finally, if still not determined, return whether the value is "falsy":
  return result !== undefined ? result : !value;
}

/** Tells whether the provided value is or can be considered as a collection. */
export function isCollection(value: any) {
  // Note: `Set` & `Map` instances are told to true by `_.isObjectLike` so no additional testing is required.
  return _.isObjectLike(value) || _.isArrayLike(value);
}

/**
 * Removes empty values from the given collection.
 *
 * @example
 * • removeEmptyValues({A: 'a', B: '', C: null, D: 'd', E: undefined, F: true}) → {A: 'a', D: 'd', F: true}
 *
 * @param collection Collection from which to remove the empty values.
 *
 * @see #isEmpty
 */
export function removeEmptyValues<C extends any | any[]>(collection: C): C {
  return filter(collection, value => !isEmpty(value));
}

/**
 * Removes missing values from the given collection.
 *
 * @example
 * • removeMissingValues({A: 'a', B: '', C: null, D: 'd', E: undefined, F: true}) → {A: 'a', B: '', D: 'd', F: true}
 *
 * @param collection Collection from which to remove the missing values.
 */
export function removeMissingValues<C extends any | any[]>(collection: C): C {
  return filter(collection, value => !_.isNil(value));
}

/**
 * Filters the given collection using the provided predicate.
 *
 * @param collection Collection from which to filter the values.
 */
export function filter<C extends any | any[]>(collection: C, predicate: (value: any) => boolean): C {
  let result: any = collection;

  if (!_.isNil(predicate)) {
    if (_.isArray(collection)) {
      result = _.filter(collection, predicate);
    } else {
      result = _.pickBy(collection, predicate);
    }
  }

  return result;
}

/**
 * Converts the provided collection into a dictionary.
 *
 * @param collection Collection to convert into a dictionary.
 * @param mapper Function used to make the keys of the resulting dictionary.
 */
export function toDictionary<T, C extends T[]>(
  collection: C,
  mapper: (value: T, index: number) => string = (value: T, index: number) => String(index)
): { [key: string]: T } {
  return _.reduce(
    collection,
    (accumulator, value, index) => {
      const key = mapper(value, index);
      accumulator[key] = value;
      return accumulator;
    },
    {}
  );
}

/**
 * Tells whether the provided model is matching with the expected model.
 *
 * @example
 *  • isMatching({'A': 1, 'B': 2, 'C': 3}, {'A': 1, 'B': true}) // → false
 *  • isMatching({'A': 1, 'B': true, 'C': 3}, {'A': 1, 'B': true}) // → true
 *
 * @param model Model to check.
 * @param expectedModel Structure composed of fixed values, describing what the model should be matching with.
 * @param keyFilter Keys of the fields to consider for the operation.
 */
export function isMatching(model: any, expectedModel: any, keyFilter?: string[]) {
  let _expectedModel = expectedModel;
  if (!isEmpty(keyFilter)) {
    _expectedModel = _.pick(expectedModel, keyFilter);
  }

  return _.isMatch(model, _expectedModel);
}

// tslint:disable-next-line:interface-over-type-literal
export type CompatibilityRuleSet = { [key: string]: (value: any) => boolean };

/**
 * Tells whether the provided model is compatible with the expected model.
 *
 * This method is very similar to `#isMatching` but also offers the ability to
 * specify rules (predicates) instead of fixed values only.
 *
 * @example
 *  • isCompatible({'A': 1, 'B': 2, 'C': 3}, {'A': 1, 'B': _.isBoolean}) // → false
 *  • isCompatible({'A': 1, 'B': true, 'C': 3}, {'A': 1, 'B': _.isBoolean}) // → true
 *
 * @param model Model to check.
 * @param expectedModel Structure composed of both fixed values and rules, describing what the model should be matching with.
 * @param keyFilter Keys of the fields to consider for the operation.
 */
export function isCompatible(model: any, expectedModel: any, keyFilter?: string[]) {
  const modelSubSet: any = {};
  const _expectedModel: any = {};
  const compatibilityRules: CompatibilityRuleSet = {};

  let isCompatibleRulesEmpty: boolean = true;
  _.forEach(expectedModel, (value, key) => {
    if (isEmpty(keyFilter) || (keyFilter && keyFilter.indexOf(key) > -1)) {
      if (typeof value !== 'function') {
        _expectedModel[key] = value;
      } else {
        compatibilityRules[key] = value;
        modelSubSet[key] = model[key];
        isCompatibleRulesEmpty = false;
      }
    }
  });

  let result = _.isMatch(model, _expectedModel);
  if (!isCompatibleRulesEmpty) {
    result = result && _.conformsTo(modelSubSet, compatibilityRules);
  }

  return result;
}
