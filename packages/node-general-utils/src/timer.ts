import * as moment from 'moment';

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
    const millisecs = Math.round(end[0] * 1000 + this.start[1] / 1000000);

    return millisecs;
  }

  /**
   * Computes the amount of time elapsed since the
   * timer was started and returns a string to represents
   * this duration.
   *
   * @param format the format to use for the resulting string. The
   * default format is "HH:mm:ss.SSS". Have a look at the moment library
   * documentation to see how to define a custom format :
   * https://momentjs.com/docs/#/displaying/format/
   */
  public toString(format: string = 'HH:mm:ss.SSS'): string {
    const millisecs = this.getMillisecondsElapsed();
    return moment.utc(millisecs).format(format);
  }
}
