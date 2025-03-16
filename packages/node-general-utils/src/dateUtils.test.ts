import { assert } from 'chai';
import _ from 'lodash';
import moment from 'moment';
import { getValueDescription, getValueDescriptionWithType, utils } from '.';
import { getCartesianProduct } from './collectionUtils';
import {
  DateRangeDefinition,
  DEFAULT_DATE_FORMAT,
  endOfDay,
  formatUtcDate,
  getSafeDate,
  getSafeDateRange,
  isDateBetween,
  isDateCompatible,
  isDateRange,
  ISO_DATE_PATTERN,
  isValidIso8601Date,
  parseDate,
  startOfDay,
} from './dateUtils';

const VALID_DATE_UTC_REPRESENTATION = '2018-07-31T12:34:56.789Z';
const VALID_DATE = new Date(VALID_DATE_UTC_REPRESENTATION);

// tslint:disable:max-func-body-length
describe('Date Utility', () => {
  describe('#isDateBetween', () => {
    it('should support open ranges', () => {
      assert.isTrue(isDateBetween('2018-01-01T12:34:56', ['2018-01-01T12:34:56', undefined]));
      assert.isTrue(isDateBetween('2018-01-01T12:34:56', ['2018-01-01T12:34:56', null]));
      assert.isFalse(isDateBetween('2018-01-01T12:34:56', ['2018-01-01T12:34:56.123', undefined]));
      assert.isFalse(isDateBetween('2018-01-01T12:34:56', ['2018-01-01T12:34:56.123', null]));
      assert.isTrue(isDateBetween('2018-01-01T12:34:56', [undefined, '2018-01-01T12:34:56']));
      assert.isTrue(isDateBetween('2018-01-01T12:34:56', [null, '2018-01-01T12:34:56']));
      assert.isFalse(isDateBetween('2018-01-01T12:34:56', [undefined, '2018-01-01T12:34:55.999']));
      assert.isFalse(isDateBetween('2018-01-01T12:34:56', [null, '2018-01-01T12:34:55.999']));
      assert.isTrue(isDateBetween('2018-01-01T12:34:56', [undefined, undefined]));
      assert.isTrue(isDateBetween('2018-01-01T12:34:56', [null, null]));
    });
  });

  describe('#isDateCompatible', () => {
    const dateRepr = '2018-09-12T21:45:12.243Z';
    const dateValues = [dateRepr, new Date(dateRepr), moment(dateRepr)];

    getCartesianProduct(dateValues, dateValues).forEach((dateParameters) => {
      const parameter1 = dateParameters[0];
      const parameter2 = dateParameters[1];
      const parameter1TypeName = parameter1.constructor.name;
      const parameter2TypeName = parameter2.constructor.name;

      it(`should support \`${parameter1TypeName}\` & \`${parameter2TypeName}\` parameters`, () => {
        assert.isTrue(isDateCompatible(parameter1, parameter2));
      });
    });

    const date1Repr = '2018-09-12T12:34:56.789Z';
    const date1Values = [date1Repr, new Date(date1Repr), moment(date1Repr)];
    const date2Repr = '2018-09-12T21:45:12.243Z';
    const date2Values = [date2Repr, new Date(date2Repr), moment(date2Repr)];

    getCartesianProduct(date1Values, date2Values).forEach((dateRangeParameter) => {
      const dateRangeLowBoundary = dateRangeParameter[0];
      const dateRangeHighBoundary = dateRangeParameter[1];
      const dateRangeLowBoundaryTypeName = dateRangeLowBoundary.constructor.name;
      const dateRangeHighBoundaryTypeName = dateRangeHighBoundary.constructor.name;

      dateValues.forEach((dateValue) => {
        const dateValueParameterType = dateValue.constructor.name;

        it(`should support \`${dateValueParameterType}\` & [\`${dateRangeLowBoundaryTypeName}\`:\`${dateRangeHighBoundaryTypeName}\`] parameters`, () => {
          assert.isTrue(isDateCompatible(dateValue, dateRangeParameter));
        });
      });
    });
  });

  const INVALID_DATE_VALUES = [
    undefined,
    null,
    true,
    false,
    123,
    NaN,
    'pouet',
    _.noop,
    /^$/,
    {},
    [],
  ];
  const VALID_DATE_VALUES = [
    new Date(2018, 7, 31, 23, 59, 59, 999),
    new Date(2019, 0, 1, 0, 0, 0, 0),
  ];

  describe('#isDate', () => {
    INVALID_DATE_VALUES.forEach((value) => {
      const valueDescription = getValueDescriptionWithType(value);
      it(`should return \`false\` for ${valueDescription}`, () => {
        assert.isFalse(utils.isValidDate(value));
      });
    });

    VALID_DATE_VALUES.forEach((value) => {
      const valueDescription = getValueDescription(value);
      it(`should return \`true\` for ${valueDescription}`, () => {
        assert.isTrue(utils.isValidDate(value));
      });
    });
  });

  const INVALID_DATE_RANGE_VALUES = getCartesianProduct(INVALID_DATE_VALUES, INVALID_DATE_VALUES);
  const VALID_DATE_RANGE_VALUES = getCartesianProduct(VALID_DATE_VALUES, VALID_DATE_VALUES);
  // Append open ranges in valid date range values:
  VALID_DATE_VALUES.forEach((date) => {
    VALID_DATE_RANGE_VALUES.push([date, null]);
    VALID_DATE_RANGE_VALUES.push([null, date]);
  });
  // Append 3-value items into the invalid date range values:
  VALID_DATE_RANGE_VALUES.forEach((dateRange) =>
    INVALID_DATE_RANGE_VALUES.push(dateRange.concat(null)),
  );

  describe('#isDateRange', () => {
    INVALID_DATE_RANGE_VALUES.forEach((value: any[]) => {
      const valueDescription = value.map((item) => getValueDescriptionWithType(item));
      it(`should return \`false\` for [${valueDescription}]`, () => {
        assert.isFalse(isDateRange(value));
      });
    });

    VALID_DATE_RANGE_VALUES.forEach((value) => {
      const valueDescription = getValueDescription(value);
      it(`should return \`true\` for ${valueDescription}`, () => {
        assert.isTrue(isDateRange(value));
      });
    });
  });

  describe('#getSafeDate', () => {
    // Cf. http://momentjs.com/docs/#/parsing/string/
    const expectations = {
      '2018-12-07T12:34:56.789': new Date(Date.UTC(2018, 11, 7, 12, 34, 56, 789)),
      '20181207T123456.789': new Date(Date.UTC(2018, 11, 7, 12, 34, 56, 789)),
      '2018-12-07': new Date(Date.UTC(2018, 11, 7, 0, 0, 0, 0)),
    };
    _.forEach(expectations, (expectedResult, value) => {
      const valueDescription = getValueDescription(value);
      it(`should support ${valueDescription}`, () => {
        assert.deepEqual(getSafeDate(value), expectedResult);
      });
    });

    const expectedlyFailingValues = [null, undefined, 'true', 'false', '???'];
    expectedlyFailingValues.forEach((value) => {
      const valueDescription = getValueDescription(value);
      it(`should fail with ${valueDescription}`, () => {
        let failed = false;
        try {
          getSafeDate(value);
        } catch (error) {
          failed = true;
        }
        assert.isTrue(failed);
      });
    });
  });

  describe('#getSafeDateRange', () => {
    const expectations = new Map<DateRangeDefinition, [Date, Date]>();
    expectations.set([VALID_DATE_UTC_REPRESENTATION, undefined], [VALID_DATE, undefined]);
    expectations.set([null, VALID_DATE_UTC_REPRESENTATION], [null, VALID_DATE]);
    expectations.set([undefined, null], [undefined, null]);
    expectations.set([VALID_DATE_UTC_REPRESENTATION, VALID_DATE], [VALID_DATE, VALID_DATE]);
    expectations.set([VALID_DATE, VALID_DATE], [VALID_DATE, VALID_DATE]);

    for (const entry of expectations) {
      const value = entry[0];
      const expectedResult = entry[1];
      const valueDescription = `[${getValueDescriptionWithType(value[0])}, ${getValueDescriptionWithType(value[1])}]`;
      it(`should support ${valueDescription}`, () => {
        assert.deepEqual(getSafeDateRange(value), expectedResult);
      });
    }
  });

  describe('#parseDate', () => {
    it('should parse date representations properly', () => {
      assert.deepStrictEqual(parseDate(VALID_DATE_UTC_REPRESENTATION), VALID_DATE);
      assert.deepStrictEqual(
        parseDate(VALID_DATE_UTC_REPRESENTATION, DEFAULT_DATE_FORMAT),
        VALID_DATE,
      );

      const FUNKY_FORMAT = 'YYYY/MM/DD@HH:mm:ss.SSS';
      let result: Date = parseDate('2018/07/31@12:34:56.789', [FUNKY_FORMAT]);
      assert.deepStrictEqual(result.getDate(), VALID_DATE.getDate());
      result = parseDate('2018/07/31@12:34:56.789', [DEFAULT_DATE_FORMAT, FUNKY_FORMAT]);
      assert.deepStrictEqual(result.getDate(), VALID_DATE.getDate());
    });
  });

  describe('#formatDate', () => {
    it('should format dates properly', () => {
      assert.equal(formatUtcDate(VALID_DATE), VALID_DATE_UTC_REPRESENTATION);
    });
  });

  describe('ISO_DATE_PATTERN', () => {
    const expectations = {
      '2018-07-31': ['2018-07-31', '-', undefined, undefined, undefined, undefined],
      '20180731': ['20180731', '', undefined, undefined, undefined, undefined],
      '2018-07-31 00:00:59': ['2018-07-31', '-', '00:00:59', ':', undefined, undefined],
      '2018-07-31T00:59:59': ['2018-07-31', '-', '00:59:59', ':', undefined, undefined],
      '2018-07-31 23:59:59': ['2018-07-31', '-', '23:59:59', ':', undefined, undefined],
      '2018-07-31T12:34:56.789+06': ['2018-07-31', '-', '12:34:56', ':', '789', '+06'],
      '2018-07-31T12:34:56.789+10:11': ['2018-07-31', '-', '12:34:56', ':', '789', '+10:11'],
      '20180731T123456,789+1011': ['20180731', '', '123456', '', '789', '+1011'],
      '20180731 123456,789-1011': ['20180731', '', '123456', '', '789', '-1011'],
      '20180731T123456,789+10:11': ['20180731', '', '123456', '', '789', '+10:11'],
      '20180731 12:34:56,789-1011': ['20180731', '', '12:34:56', ':', '789', '-1011'],
      '2018-07-31 12:34:56.789Z': ['2018-07-31', '-', '12:34:56', ':', '789', 'Z'],
    };
    _.forEach(expectations, (expectation, value) => {
      it(`should match « ${value} »`, () => {
        assert.deepEqual(ISO_DATE_PATTERN.exec(value).slice(1), expectation);
        assert.isTrue(isValidIso8601Date(value));
      });
    });

    const invalidDateValues = [
      '201807-31', // mismatching date separator
      '2018/07/31', // bad date separator
      '2018-07-31T1234:56', // mismatching time separator
      '20180731123456', // missing date-time separator
      '2018-13-31', // month overflow
      '2018-07-32', // day overflow
      '2018-07-31 24:00:00', // hour overflow
      '2018-07-31 00:60:00', // minute overflow
      '2018-07-31 00:00:60', // second overflow
      '2018-07-31 12', // incomplete time representation
      '2018-07-31 12:34', // incomplete time representation
      '2018-07-31T12:34:56789', // bad second format
      '20180731 123456 789', // bad split second separator
      '2018-07-31 12:34:56.', // bad split second format
      '2018-07-31 12:34:56.7', // bad split second format
      '2018-07-31 12:34:56.78', // bad split second format
      '2018-07-31 01:23:45.6789', // bad split second format
      '20180731T123456.7891011', // missing time-offset separator
      '2018-07-31 01:23:45.678+1', // bad offset format
      '2018-07-31 12:34:56.789+1011Z', // bad offset format
      '2018-07-31 01:23:45.678+2400', // offset overflow
    ];
    invalidDateValues.forEach((value) => {
      it(`should *NOT* match « ${value} »`, () => {
        assert.isNull(ISO_DATE_PATTERN.exec(value));
        assert.isFalse(isValidIso8601Date(value));
      });
    });
  });

  describe('#endOfDay', () => {
    it('Nil', () => {
      let result = endOfDay(null);
      assert.deepEqual(result, null);

      result = endOfDay(undefined);
      assert.deepEqual(result, undefined);
    });

    it('Invalid', () => {
      let error;
      try {
        endOfDay(``);
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }

      try {
        endOfDay(`nope`);
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }
    });

    it('As a date - UTC', () => {
      const testDate = new Date(`2017-11-02T02:07:11.123Z`);
      const result = endOfDay(testDate, 'UTC');
      assert.deepEqual(result.toISOString(), `2017-11-02T23:59:59.999Z`);
    });

    // ==========================================
    // This test shows how timezone sensitive is the
    // `endOfDay()` function!
    // The specified date is "2017-11-02T02:07:11" but
    // *UTC*. If we are in a timezone with a current offset.
    // like "-4" (Montreal is -4 or -5, depending of if
    // we are Daylight Time or not), then the local
    // date is actually "2017-11-01T22:07:11"...
    //
    // When calling `endOfDay()` we need to tell it in
    // which timezone we want the computation to be made
    // otherwise it will use the timezone local to the
    // server. If the server runs on a "UTC" timezone,
    // the end of the day will be "2017-11-02T23:59:59".
    // But on a "UTC-4" timezone, the end of the day would
    // actually be "2017-11-01T23:59:59"!
    //
    // Because of this, we can't have reliable tests
    // using "America/Monteal" as the timezone, because
    // this timezone can be either "UTC-4" or "UTC-5".
    // Tests using such timezone may succeed one day
    // and fail the other!
    // ==========================================
    it('As a date - UTC-4', () => {
      const testDate = new Date(`2017-11-02T02:07:11.123Z`);
      const result = endOfDay(testDate, 'UTC-4');
      assert.deepEqual(result.toISOString(), `2017-11-02T03:59:59.999Z`);
    });

    it('As a string', () => {
      const date = `2017-11-02T02:07:11.123Z`;
      const result = endOfDay(date, 'UTC');
      assert.deepEqual(result.toISOString(), `2017-11-02T23:59:59.999Z`);
    });
  });

  describe('#startOfDay', () => {
    it('Nil', () => {
      let result = startOfDay(null);
      assert.deepEqual(result, null);

      result = startOfDay(undefined);
      assert.deepEqual(result, undefined);
    });

    it('Invalid', () => {
      let error;
      try {
        startOfDay(``);
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }

      try {
        startOfDay(`nope`);
      } catch (err) {
        error = err;
      }
      if (!error) {
        assert.fail();
      }
    });

    it('As a date - UTC', () => {
      const date = new Date(`2017-11-02T02:07:11.123Z`);
      const result = startOfDay(date, 'UTC');
      assert.deepEqual(result.toISOString(), `2017-11-02T00:00:00.000Z`);
    });

    it('As a date - UTC-4', () => {
      const testDate = new Date(`2017-11-02T02:07:11.123Z`);
      const result = startOfDay(testDate, 'UTC-4');
      assert.deepEqual(result.toISOString(), `2017-11-01T04:00:00.000Z`);
    });

    it('As a string', () => {
      const date = `2017-11-02T02:07:11.123Z`;
      const result = startOfDay(date, 'UTC');
      assert.deepEqual(result.toISOString(), `2017-11-02T00:00:00.000Z`);
    });
  });
});
