import { DateTime } from 'luxon';

/**
 * A Timer object. Can be used to compute time elapsed
 * from its creation to the moment one of its methods
 * is called.
 *
 * For example :
 *
 * let timer = new Timer();
 *
 * // ... do something
 *
 * console.log(timer.getMillisecondsElapsed());
 * console.log(timer.toString());
 */
export class Timer {
  private start: any;

  constructor() {
    this.start = process.hrtime();
  }

  /**
   * The number of smilliseconds elapsed since the
   * time was started.
   */
  public getMillisecondsElapsed(): number {
    const end = process.hrtime(this.start);
    const millisecs = Math.round(end[0] * 1000 + end[1] / 1000000);

    return millisecs;
  }

  /**
   * Computes the amount of time elapsed since the
   * timer was started and returns a string to represents
   * this duration.
   *
   * @param format the format to use for the resulting string. The
   * default format is "HH:mm:ss.SSS". Have a look at the Luxon library
   * documentation to see how to define a custom format :
   * https://moment.github.io/luxon/#/formatting?id=table-of-tokens
   */
  public toString(format = 'HH:mm:ss.SSS'): string {
    const millisecs = this.getMillisecondsElapsed();
    const mappedFormat = format
      .replace(/Y/g, 'y')
      .replace(/D/g, 'd')
      .replace(/A/g, 'a')
      .replace(/Z/g, 'ZZ');
    return DateTime.fromMillis(millisecs, { zone: 'utc' }).toFormat(mappedFormat);
  }
}
