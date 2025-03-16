import * as _ from 'lodash';

/**
 * Adds the specified prefix before the provided value.
 *
 * @param value Value which to add the prefix before.
 * @param prefix Prefix to add before the value.
 */
// tslint:disable-next-line:no-shadowed-variable
export function prefix(value: string, prefix: string): string {
  let result: string = value;

  if (!_.isNil(value)) {
    if (!_.isNil(prefix)) {
      result = prefix + value;
    }
  }

  return result;
}

/**
 * Adds the specified suffix after the provided value.
 *
 * @param value Value which to add the suffix after.
 * @param suffix Suffix to add after the value.
 */
// tslint:disable-next-line:no-shadowed-variable
export function suffix(value: string, suffix: string): string {
  let result: string = value;

  if (!_.isNil(value)) {
    if (!_.isNil(suffix)) {
      result += suffix;
    }
  }

  return result;
}

/**
 * Replace all continous sequences of the specified characters
 * in a string with the specified replacement.
 *
 * Examples:
 *
 * If `str` is "a      b", then "deDuplicateChars(str, ' ', '_')"
 * would result in:  "a_b".
 *
 * If `str` is "a \r\n   \t  \n \t   b", then "deDuplicateChars(str, ' \t\r\n', ' ')"
 * would result in:  "a b".
 *
 * Note that this function will not *trim* all whitespaces at the
 * start and end of the string, except if the `replacement` parameter
 * is an empty string!
 *
 * @oaram continuousCharsToReplace A string that act as *a set of characters*
 * to find... Their order in the string is not important! Ex: ' \t\n' is
 * the same as '\n \t'.
 *
 * @param trimStartEnd If `true`, the `continuousCharsToReplace` will not
 *  be replaced on the start and end of the string but *removed*. In otherwords,
 *  only inside the string those characters will be replaced by the
 *  `replacement`, they will be removed at the start and end.
 */
export function deDuplicateChars(
  value: string,
  continuousCharsToReplace: string,
  replacement: string,
  trimStartEnd = false,
): string {
  if (
    _.isNil(value) ||
    _.isNil(continuousCharsToReplace) ||
    continuousCharsToReplace === '' ||
    _.isNil(replacement)
  ) {
    return value;
  }

  let regExCharsToReplace = '(';
  for (const char of continuousCharsToReplace) {
    regExCharsToReplace += (char !== '\\' ? char : '\\\\') + '|';
  }
  regExCharsToReplace = regExCharsToReplace.slice(0, -1) + ')+';

  const regEx = new RegExp(regExCharsToReplace, 'g');

  let valueClean = value.replace(regEx, replacement);

  if (trimStartEnd) {
    valueClean = _.trim(valueClean, replacement);
  }

  return valueClean;
}

/**
 * Replace any sequence of whitespaces, newlines and tabs found
 * in a string by a single whitespace. Also trim the start and end
 * of the string (no whitespaces).
 *
 * For more flexibility, use the `deDuplicateChars()` function
 * directly!
 */
export function trimAll(value: string): string {
  const charsToRemove = ' \r\n\t';
  return deDuplicateChars(value, charsToRemove, ' ', true);
}
