import _ from 'lodash';
import { DateTime, Zone } from 'luxon';
import moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import { getValueDescription, utils } from '.';

export function isDateEqual(value: DateDefinition, expectedDate: DateDefinition) {
  const _moment: Moment = moment(value);
  const expectedMoment = moment(expectedDate);

  return _moment.isSame(expectedMoment);
}

/** @see https://momentjs.com/docs/#/query/is-between/ */
export function isDateBetween(
  value: DateDefinition,
  expectedDate: DateRangeDefinition,
  inclusivity: '()' | '[)' | '(]' | '[]' = '[]',
) {
  const _moment: Moment = moment(value);
  const from = expectedDate[0];
  const to = expectedDate[1];
  if (from === null || from === undefined) {
    if (inclusivity[1] === ')') {
      return _moment.isBefore(to);
    }
    return !_moment.isAfter(to);
  }
  if (to === null || to === undefined) {
    if (inclusivity[0] === '(') {
      return _moment.isAfter(from);
    }
    return !_moment.isBefore(from);
  }
  return _moment.isBetween(from, to, null, inclusivity);
}

export type DateDefinition = string | Date | Moment;
export type DateRangeDefinition = [DateDefinition, DateDefinition];
export type CompatibleDateDefinition = DateDefinition | DateRangeDefinition;

/**
 * Tells whether the provided value is a date range.
 *
 * Valid date ranges are either:
 * - `[null, null]`: Open date range.
 * - `[Date, null]`: Date range with low boundary, without high boundary.
 * - `[null, Date]`: Date range without low boundary, with high boundary.
 * - `[Date, Date]`: Date range with both low and high boundaries.
 */
export function isDateRange(value: any[]): boolean {
  let result: boolean = !!value && value.length === 2;

  if (result) {
    let dateItemCount = 0;
    let otherItemCount = 0;

    for (const item of value) {
      if (utils.isValidDate(item)) {
        dateItemCount++;
      } else if (item !== undefined && item !== null) {
        otherItemCount++;
      }
    }

    result = dateItemCount > 0 && otherItemCount < 1;
  }

  return result;
}

/**
 * Returns a "safe" date from the given definition.
 *
 * - `String` values are not considered "safe" since they can contain anything, including invalid dates.
 * - `Moment` values are not considered "safe" since they tolerate exceptions and advanced
 * features that `Date` doesn't support.
 */
export function getSafeDate(dateDefinition: DateDefinition): Date {
  let result: Date;

  if (dateDefinition !== undefined && dateDefinition !== null) {
    result = moment.utc(dateDefinition).toDate();
  }

  if (!result || !utils.isValidDate(result)) {
    throw new Error(`Unsupported date definition! ${getValueDescription(dateDefinition)}`);
  }

  return result;
}

/**
 * Returns a "safe" date range from the given definition.
 *
 * @see `#getSafeDate`
 */
export function getSafeDateRange(dateRangeDefinition: DateRangeDefinition): [Date, Date] {
  const lowBoundary = dateRangeDefinition[0]
    ? getSafeDate(dateRangeDefinition[0])
    : (dateRangeDefinition[0] as any);
  const highBoundary = dateRangeDefinition[1]
    ? getSafeDate(dateRangeDefinition[1])
    : (dateRangeDefinition[1] as any);

  return [lowBoundary, highBoundary];
}

/**
 * Tells whether the provided date is compatible with the specified date definition.
 *
 * Possible cases:
 * - `value`: `Date` & `expectedDate`: `Date` → whether `value` = `expectedDate`.
 * - `value`: `Date` & `expectedDate`: `DateRange` → whether `value` is within `expectedDate`.
 */
export function isDateCompatible(value: DateDefinition, expectedDate: CompatibleDateDefinition) {
  let compatible = false;

  if (expectedDate instanceof Array) {
    compatible = isDateBetween(value, expectedDate);
  } else {
    compatible = isDateEqual(value, expectedDate);
  }

  return compatible;
}

export type TimeUnitSymbol = 'ms' | 's' | 'm' | 'h' | 'd' | 'w';

export function getDateRangeAround(
  value: DateDefinition,
  marginValue: number,
  marginUnit: TimeUnitSymbol,
): DateRangeDefinition {
  const _moment = moment(value);
  return [_moment.subtract(marginValue, marginUnit), _moment.add(marginValue, marginUnit)];
}

/**
 * Pattern matching most ISO 8601 date representations (including time), and which can be used for any kind of validation.
 * @example `2018-07-31T12:34:56.789+10:11`
 */
export const ISO_DATE_PATTERN =
  /^(\d{4}(-?)(?:0\d|1[0-2])\2?(?:[0-2]\d|3[0-1]))(?:[T ]([0-2][0-3](:?)[0-5]\d\4[0-5]\d)(?:[.,](\d{3}))?([+-](?:[01]\d(?::?[0-5]\d)?)|Z)?)?$/;

/**
 * Tells whether the provided date representation is valid as per ISO 8601.
 *
 * @see `ISO_DATE_PATTERN`
 */
export function isValidIso8601Date(representation: string): boolean {
  let valid = false;

  if (representation !== undefined && representation !== null) {
    valid = ISO_DATE_PATTERN.test(representation);
  }

  return valid;
}

/**
 * Format used to represent dates, and which is compatible with Moment.js & others.
 * Note: It produces ISO-compatible dates, and which also works well with T-SQL.
 * @see `#parseDate`
 * @see `#formatDate`
 * @see https://momentjs.com/docs/#/displaying/format/
 */
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

/**
 * Parses the given date representation using the provided format (or the default ISO format).
 * @see `#formatDate`
 */
export function parseDate(
  representation: string,
  format: string | string[] = DEFAULT_DATE_FORMAT,
): Date {
  const formats: string[] = format instanceof Array ? format : [format];
  return moment.utc(representation, formats).toDate();
}

/**
 * Formats the given date using the provided format (or the default ISO format).
 *
 * @see `#parseDate`
 */
export function formatDate(date: DateDefinition, format: string = DEFAULT_DATE_FORMAT) {
  return (
    moment(date)
      .format(format)
      // Ensure that 'Z' is used instead of '+00:00' at the end of UTC dates:
      .replace(/[+-]00:?00$/, 'Z')
  );
}

/**
 * Formats the UTC version of the given date using the provided format (or the default ISO format).
 *
 * @see `#formatDate`
 */
export function formatUtcDate(date: DateDefinition, format: string = DEFAULT_DATE_FORMAT) {
  return formatDate(moment(date).utc(), format);
}

/**
 * Return the specified date at its very beginning
 * "00:00:00.000".
 *
 * IMPORTANT: this function is very timezone sensitive!
 * If you want to start of day in another timezone than
 * 'America/Montreal', you *need* to specify it.
 * Here's why:
 *
 * Let say the specofoed ISO date is "2017-11-02T02:07:11.123Z".
 * If we are located in a UTC timezone, the end of day for
 * this date is "2017-11-02T23:59:59", it would be the same day
 * as the one displayed in the ISO string.
 * But if we are in Montreal, and the current timezone offset is "-4",
 * then the ISO date actually referes to the "2017-11-01" day and
 * start of day would need to be "2017-11-01T23:59:59", not
 * "2017-11-02T23:59:59"!
 *
 * By default, the handling of dates, by Node itself or by various
 * third-party, all use the timezone of the server to make calculations
 * such as "start of day". This is error-prone as the result depends
 * on how the server is configured. This is why a timezone must be
 * specified here.
 */
export function startOfDay(
  isoDate: Date | string,
  timezone: string | Zone = 'America/Montreal',
): Date {
  if (_.isNil(isoDate)) {
    return isoDate;
  }

  let luxonDate = DateTime.fromISO(_.isDate(isoDate) ? isoDate.toISOString() : isoDate);
  if (!luxonDate.isValid) {
    throw new Error(`Invalid ISO date ${JSON.stringify(isoDate)} : ${luxonDate.invalidReason}`);
  }

  luxonDate = luxonDate.setZone(timezone);

  const date = luxonDate.startOf('day').toJSDate();
  return date;
}

/**
 * Return the specified date at its last milliseconds:
 * "23:59:59.999".
 *
 * IMPORTANT: this function is very timezone sensitive!
 * If you want to start of day in another timezone than
 * 'America/Montreal', you *need* to specify it.
 *
 * Please read the comments of the `startOfDay` for more
 * information.
 *
 */
export function endOfDay(
  isoDate: Date | string,
  timezone: string | Zone = 'America/Montreal',
): Date {
  if (_.isNil(isoDate)) {
    return isoDate;
  }

  let luxonDate = DateTime.fromISO(_.isDate(isoDate) ? isoDate.toISOString() : isoDate);
  if (!luxonDate.isValid) {
    throw new Error(`Invalid ISO date ${JSON.stringify(isoDate)} : ${luxonDate.invalidReason}`);
  }

  luxonDate = luxonDate.setZone(timezone);

  const date = luxonDate.endOf('day').toJSDate();
  return date;
}
