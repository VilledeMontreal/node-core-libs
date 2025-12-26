import { DateTime, Zone } from 'luxon';
import { getValueDescription, utils } from '.';
import { isDate, isNil } from 'lodash';

/**
 * Internal helper to convert a DateDefinition to a Luxon DateTime.
 */
function toDateTime(value: DateDefinition): DateTime {
  if (value instanceof DateTime) {
    return value;
  }
  if (isDate(value)) {
    return DateTime.fromJSDate(value);
  }
  if (typeof value === 'string') {
    const dt = DateTime.fromISO(value);
    if (dt.isValid) {
      return dt;
    }
    // Fallback for some non-standard ISO formats that moment handled
    return DateTime.fromFormat(value, 'yyyy/MM/dd');
  }
  return DateTime.invalid('Unsupported date definition');
}

/**
 * Internal helper to convert a DateDefinition to a UTC Luxon DateTime.
 */
function toUtcDateTime(value: DateDefinition, formats?: string | string[]): DateTime {
  if (value instanceof DateTime) {
    return value.toUTC();
  }
  if (isDate(value)) {
    return DateTime.fromJSDate(value, { zone: 'utc' });
  }
  if (typeof value === 'string') {
    if (formats) {
      const formatList = Array.isArray(formats) ? formats : [formats];
      for (const format of formatList) {
        // Map moment format to luxon format if needed, but here we assume luxon compatible formats are passed or we'll handle them in parseDate
        const dt = DateTime.fromFormat(value, format, { zone: 'utc' });
        if (dt.isValid) {
          return dt;
        }
      }
    }
    const dt = DateTime.fromISO(value, { zone: 'utc' });
    if (dt.isValid) {
      return dt;
    }
  }
  return DateTime.invalid('Unsupported date definition');
}

export function isDateEqual(value: DateDefinition, expectedDate: DateDefinition) {
  const dt = toDateTime(value);
  const expectedDt = toDateTime(expectedDate);

  return dt.toMillis() === expectedDt.toMillis();
}

/** @see https://moment.github.io/luxon/#/ */
export function isDateBetween(
  value: DateDefinition,
  expectedDate: DateRangeDefinition,
  inclusivity: '()' | '[)' | '(]' | '[]' = '[]',
) {
  const dt = toDateTime(value);
  const from = expectedDate[0];
  const to = expectedDate[1];

  const fromDt = from !== null && from !== undefined ? toDateTime(from) : null;
  const toDt = to !== null && to !== undefined ? toDateTime(to) : null;

  if (!fromDt) {
    if (!toDt) {
      return true;
    }
    if (inclusivity[1] === ')') {
      return dt.toMillis() < toDt.toMillis();
    }
    return dt.toMillis() <= toDt.toMillis();
  }
  if (!toDt) {
    if (inclusivity[0] === '(') {
      return dt.toMillis() > fromDt.toMillis();
    }
    return dt.toMillis() >= fromDt.toMillis();
  }

  const leftInclusive = inclusivity[0] === '[';
  const rightInclusive = inclusivity[1] === ']';

  const afterFrom = leftInclusive
    ? dt.toMillis() >= fromDt.toMillis()
    : dt.toMillis() > fromDt.toMillis();
  const beforeTo = rightInclusive
    ? dt.toMillis() <= toDt.toMillis()
    : dt.toMillis() < toDt.toMillis();

  return afterFrom && beforeTo;
}

export type DateDefinition = string | Date | DateTime;
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
 * - `DateTime` values are not considered "safe" since they tolerate exceptions and advanced
 * features that `Date` doesn't support.
 */
export function getSafeDate(dateDefinition: DateDefinition): Date {
  let result: Date;

  if (dateDefinition !== undefined && dateDefinition !== null) {
    result = toUtcDateTime(dateDefinition).toJSDate();
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

const TIME_UNIT_MAPPING: Record<TimeUnitSymbol, string> = {
  ms: 'milliseconds',
  s: 'seconds',
  m: 'minutes',
  h: 'hours',
  d: 'days',
  w: 'weeks',
};

export function getDateRangeAround(
  value: DateDefinition,
  marginValue: number,
  marginUnit: TimeUnitSymbol,
): DateRangeDefinition {
  const dt = toDateTime(value);
  const unit = TIME_UNIT_MAPPING[marginUnit];
  return [dt.minus({ [unit]: marginValue }), dt.plus({ [unit]: marginValue })];
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
 * Format used to represent dates, and which is compatible with Luxon.
 * Note: It produces ISO-compatible dates, and which also works well with T-SQL.
 * @see `#parseDate`
 * @see `#formatDate`
 * @see https://moment.github.io/luxon/#/formatting?id=table-of-tokens
 */
export const DEFAULT_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZ";

/**
 * Parses the given date representation using the provided format (or the default ISO format).
 * @see `#formatDate`
 */
export function parseDate(
  representation: string,
  format: string | string[] = DEFAULT_DATE_FORMAT,
): Date {
  const formats: string[] = format instanceof Array ? format : [format];

  // Map moment tokens to luxon tokens if they look like moment formats
  const mappedFormats = formats.map((f) =>
    f
      .replace(/Y/g, 'y')
      .replace(/D/g, 'd')
      .replace(/A/g, 'a')
      .replace(/(^|[^Z])Z($|[^Z])/, '$1ZZ$2'),
  );

  return toUtcDateTime(representation, mappedFormats).toJSDate();
}

/**
 * Formats the given date using the provided format (or the default ISO format).
 *
 * @see `#parseDate`
 */
export function formatDate(date: DateDefinition, format: string = DEFAULT_DATE_FORMAT) {
  // Map moment tokens to luxon tokens if they look like moment formats
  const mappedFormat = format
    .replace(/Y/g, 'y')
    .replace(/D/g, 'd')
    .replace(/A/g, 'a')
    .replace(/(^|[^Z])Z($|[^Z])/, '$1ZZ$2');

  return (
    toDateTime(date)
      .toFormat(mappedFormat)
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
  const dt = toDateTime(date).toUTC();
  return formatDate(dt, format);
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
  if (isNil(isoDate)) {
    return isoDate;
  }

  let luxonDate = DateTime.fromISO(isDate(isoDate) ? isoDate.toISOString() : isoDate);
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
  if (isNil(isoDate)) {
    return isoDate;
  }

  let luxonDate = DateTime.fromISO(isDate(isoDate) ? isoDate.toISOString() : isoDate);
  if (!luxonDate.isValid) {
    throw new Error(`Invalid ISO date ${JSON.stringify(isoDate)} : ${luxonDate.invalidReason}`);
  }

  luxonDate = luxonDate.setZone(timezone);

  const date = luxonDate.endOf('day').toJSDate();
  return date;
}
