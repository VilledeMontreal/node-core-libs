import { assert } from 'chai';
import { IPaginatedResult, isPaginatedResult } from './pagination';

// ==========================================
// Pagination tests
// ==========================================
describe('pagination object', () => {
  it('offset : 0 | limit : 3', async () => {
    const numberlist: { name: string; value: number }[] = [
      { name: 'one', value: 1 },
      { name: 'two', value: 2 },
      { name: 'three', value: 3 },
      { name: 'four', value: 4 },
      { name: 'five', value: 5 },
      { name: 'six', value: 6 },
      { name: 'seven', value: 7 },
      { name: 'eight', value: 8 },
      { name: 'nine', value: 9 },
      { name: 'ten', value: 10 },
    ];
    const result: IPaginatedResult<any> = {
      items: numberlist.slice(0, 3),
      paging: {
        limit: 3,
        offset: 0,
        totalCount: numberlist.length,
      },
    };

    assert.isOk(result);
    assert.isOk(result.items);
    assert.isOk(result.paging);

    assert.strictEqual(result.paging.offset, 0);
    assert.strictEqual(result.paging.limit, 3);
    assert.strictEqual(result.paging.totalCount, 10);

    assert.strictEqual(result.items.length, 3);
    assert.strictEqual(result.items[0].name, 'one');
    assert.strictEqual(result.items[1].name, 'two');
    assert.strictEqual(result.items[2].name, 'three');

    assert.isTrue(isPaginatedResult(result));
    assert.strictEqual(result.paging.offset, 0);
    assert.strictEqual(result.paging.limit, 3);
    assert.strictEqual(result.paging.totalCount, 10);
    assert.strictEqual(result.items.length, 3);
  });
});
