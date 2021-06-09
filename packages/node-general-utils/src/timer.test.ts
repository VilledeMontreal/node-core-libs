import { assert } from 'chai';
import { Timer } from './timer';
import { utils } from './utils';

// ==========================================
// Timer object tests
// ==========================================
describe('Timer object', () => {
  it('Milliseconds', async function() {
    this.timeout(4000);

    const timer = new Timer();
    let milliSecs = timer.getMillisecondsElapsed();
    assert.isNotNaN(milliSecs);
    assert.isTrue(milliSecs < 1000);

    await utils.sleep(1010);

    milliSecs = timer.getMillisecondsElapsed();
    assert.isNotNaN(milliSecs);
    assert.isTrue(milliSecs > 1000 && milliSecs < 2000, `was "${milliSecs}"`);

    await utils.sleep(1001);

    milliSecs = timer.getMillisecondsElapsed();
    assert.isNotNaN(milliSecs);
    assert.isTrue(milliSecs > 2000, `was "${milliSecs}"`);
  });

  it('Default format', async function() {
    this.timeout(4000);

    const timer = new Timer();

    await utils.sleep(1010);

    let elapsed = timer.toString();
    assert.isTrue(elapsed.startsWith('00:00:01.'), `was "${elapsed}"`);

    await utils.sleep(1010);

    elapsed = timer.toString();
    assert.isTrue(elapsed.startsWith('00:00:02.'), `was "${elapsed}"`);
  });

  it('Custom format', async function() {
    this.timeout(4000);

    const timer = new Timer();

    await utils.sleep(1010);

    let elapsed = timer.toString('s');
    assert.strictEqual(elapsed, '1', `was "${elapsed}"`);

    await utils.sleep(1010);

    elapsed = timer.toString('s');
    assert.strictEqual(elapsed, '2', `was "${elapsed}"`);
  });
});
