// Ok for test files
// tslint:disable:max-func-body-length

import { isPaginatedResult } from '@villedemontreal/general-utils';
import { assert } from 'chai';
import { Knex } from 'knex';
import { IKnexMockedClient, knexUtils } from './knexUtils';
import { setTestingConfigurations } from './utils/testingConfigurations';

// ==========================================
// Set Testing configurations
// ==========================================
setTestingConfigurations();

// ==========================================
// Knex Utilities
// ==========================================
describe('Knex Utilities', () => {
  let mockedClient: IKnexMockedClient;

  before(async () => {
    mockedClient = await knexUtils.createKnexMockedClient();
  });

  beforeEach(async () => {
    mockedClient.beforeQuerySpy.resetHistory();
    mockedClient.resultStub.returns([]);
    mockedClient.totalCountStub.returns(0);
  });

  // ==========================================
  // paginate() and totalCount()
  // ==========================================
  describe('paginate() and totalCount()', () => {
    // ==========================================
    // totalCount()
    // ==========================================
    describe('- totalCount()', () => {
      it('default', async () => {
        const queryBuilder = mockedClient
          .select('id', 'author', 'title')
          .from('books')
          .orderBy('author');

        await knexUtils.totalCount(mockedClient, queryBuilder);
        const queryInfo: any = mockedClient.beforeQuerySpy.getCall(0).args[0];

        assert.isOk(queryInfo);
        assert.isOk(queryInfo.sql);
        assert.isOk(queryInfo.bindings);

        assert.strictEqual(
          queryInfo.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfo.bindings.length, 1);
        assert.strictEqual(queryInfo.bindings[0], 1);
      });

      it('removes offset and limit', async () => {
        await knexUtils.totalCount(
          mockedClient,
          mockedClient
            .select('id', 'author', 'title')
            .from('books')
            .orderBy('author')
            .offset(2)
            .limit(3),
        );

        const queryInfo: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfo.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfo.bindings.length, 1);
        assert.strictEqual(queryInfo.bindings[0], 1);
      });

      it('more complex query', async () => {
        const subSelect = mockedClient
          .select('title')
          .from('books')
          .where('author', 'author_02')
          .as('test');

        const queryBuilder = mockedClient
          .select('id', 'author', subSelect)
          .from('books')
          .whereIn('author', ['author_01', 'author_03', 'author_04'])
          .orderBy('author', 'desc');

        await knexUtils.totalCount(mockedClient, queryBuilder);

        const queryInfo: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfo.sql,
          'select count(*) as `count` from (select `id`, `author`, (select `title` from `books` where `author` = ?) as `test` ' +
            'from `books` where `author` in (?, ?, ?)) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfo.bindings.length, 5);
        assert.strictEqual(queryInfo.bindings[4], 1);
      });

      it('with distinct', async () => {
        await knexUtils.totalCount(
          mockedClient,
          mockedClient.distinct('info').from('books').orderBy('author').offset(0).limit(3),
        );

        const queryInfo: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfo.sql,
          'select count(*) as `count` from (select distinct `info` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfo.bindings.length, 1);
        assert.strictEqual(queryInfo.bindings[0], 1);
      });
    });

    // ==========================================
    // paginate()
    // ==========================================
    describe('- paginate()', () => {
      it('Without pagination', async () => {
        await mockedClient.select('id', 'author', 'title').from('books').orderBy('author');

        const queryInfo: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfo.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc',
        );
        assert.strictEqual(queryInfo.bindings.length, 0);
      });

      it('offset : 0 | limit : 3', async () => {
        const queryBuilder = mockedClient
          .select('id', 'author', 'title')
          .from('books')
          .orderBy('author');

        await knexUtils.paginate(mockedClient, queryBuilder, 0, 3);

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 1);
        assert.strictEqual(queryInfoResultSet.bindings[0], 3);
      });

      it('offset : 3 | limit : 3', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          3,
          3,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 3);
        assert.strictEqual(queryInfoResultSet.bindings[1], 3);
      });

      it('offset : 6 | limit : 3', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          6,
          3,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 3);
        assert.strictEqual(queryInfoResultSet.bindings[1], 6);
      });

      it('offset : 9 | limit : 3', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          9,
          3,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 3);
        assert.strictEqual(queryInfoResultSet.bindings[1], 9);
      });

      it('offset : 9 | limit : 1', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          9,
          1,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 1);
        assert.strictEqual(queryInfoResultSet.bindings[1], 9);
      });

      it('offset : 9 | limit : 0', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          9,
          0,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 1);
        assert.strictEqual(queryInfoResultSet.bindings[1], 9);
      });

      it('offset : 0 | limit : 1', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          0,
          1,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 1);
        assert.strictEqual(queryInfoResultSet.bindings[0], 1);
      });

      it('offset : -1 | limit : 1', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          -1,
          1,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 1);
        assert.strictEqual(queryInfoResultSet.bindings[0], 1);
      });

      it('offset : 0 | limit : 0', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          0,
          0,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 1);
        assert.strictEqual(queryInfoResultSet.bindings[0], 1);
      });

      it('offset : 0 | limit : -1', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          0,
          -1,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 1);
        assert.strictEqual(queryInfoResultSet.bindings[0], 1);
      });

      it('offset : 0 | limit : 100', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          0,
          100,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 1);
        assert.strictEqual(queryInfoResultSet.bindings[0], 100);
      });

      it('offset : 9 | limit : 100', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          9,
          100,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 100);
        assert.strictEqual(queryInfoResultSet.bindings[1], 9);
      });

      it('offset : 10 | limit : 100', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.select('id', 'author', 'title').from('books').orderBy('author'),
          10,
          100,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 100);
        assert.strictEqual(queryInfoResultSet.bindings[1], 10);
      });

      it(`only 'select' is valid - update`, async () => {
        let error = false;
        try {
          await knexUtils.paginate(
            mockedClient,
            mockedClient
              .update('author', 'author_updated')
              .from('books')
              .where('author', 'author_01'),
            0,
            1,
          );
        } catch (err) {
          error = true;
        }
        assert.isTrue(error);
      });

      it(`only 'select' is valid - insert`, async () => {
        let error = false;
        try {
          await knexUtils.paginate(
            mockedClient,
            mockedClient
              .insert({
                author: 'author_11',
                title: 'title_11',
              })
              .into('books'),
            0,
            1,
          );
        } catch (err) {
          error = true;
        }
        assert.isTrue(error);
      });

      it(`only 'select' is valid - delete`, async () => {
        let error = false;
        try {
          await knexUtils.paginate(mockedClient, mockedClient.delete().from('books'), 0, 1);
        } catch (err) {
          error = true;
        }
        assert.isTrue(error);
      });

      it('More complex select query - offset : 0 | limit : 2', async () => {
        const subSelect = mockedClient
          .select('title')
          .from('books')
          .where('author', 'author_02')
          .as('test');

        const queryBuilder = mockedClient
          .select('id', 'author', subSelect)
          .from('books')
          .whereIn('author', ['author_01', 'author_03', 'author_04'])
          .orderBy('author', 'desc');

        await knexUtils.paginate(mockedClient, queryBuilder, 0, 2);

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, (select `title` from `books` where `author` = ?) as `test` from `books` where `author` in (?, ?, ?)) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 5);
        assert.strictEqual(queryInfoCount.bindings[4], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, (select `title` from `books` where `author` = ?) as `test` from `books` where `author` in (?, ?, ?) order by `author` desc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 5);
        assert.strictEqual(queryInfoResultSet.bindings[4], 2);
      });

      it('More complex select query - offset : 2 | limit : 2', async () => {
        const subSelect = mockedClient
          .select('title')
          .from('books')
          .where('author', 'author_02')
          .as('test');

        const queryBuilder = mockedClient
          .select('id', 'author', subSelect)
          .from('books')
          .whereIn('author', ['author_01', 'author_03', 'author_04'])
          .orderBy('author', 'desc');

        await knexUtils.paginate(mockedClient, queryBuilder, 2, 2);

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, (select `title` from `books` where `author` = ?) as `test` from `books` where `author` in (?, ?, ?)) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 5);
        assert.strictEqual(queryInfoCount.bindings[4], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, (select `title` from `books` where `author` = ?) as `test` from `books` where `author` in (?, ?, ?) order by `author` desc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 6);
        assert.strictEqual(queryInfoResultSet.bindings[4], 2);
        assert.strictEqual(queryInfoResultSet.bindings[5], 2);
      });

      it('More complex select query - offset : 3 | limit : 2', async () => {
        const subSelect = mockedClient
          .select('title')
          .from('books')
          .where('author', 'author_02')
          .as('test');

        const queryBuilder = mockedClient
          .select('id', 'author', subSelect)
          .from('books')
          .whereIn('author', ['author_01', 'author_03', 'author_04'])
          .orderBy('author', 'desc');

        await knexUtils.paginate(mockedClient, queryBuilder, 3, 2);

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select `id`, `author`, (select `title` from `books` where `author` = ?) as `test` from `books` where `author` in (?, ?, ?)) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 5);
        assert.strictEqual(queryInfoCount.bindings[4], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select `id`, `author`, (select `title` from `books` where `author` = ?) as `test` from `books` where `author` in (?, ?, ?) order by `author` desc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 6);
        assert.strictEqual(queryInfoResultSet.bindings[4], 2);
        assert.strictEqual(queryInfoResultSet.bindings[5], 3);
      });

      it('with distinct', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.distinct('info').from('books').orderBy('author'),
          1,
          100,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select distinct `info` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select distinct `info` from `books` order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 2);
        assert.strictEqual(queryInfoResultSet.bindings[0], 100);
        assert.strictEqual(queryInfoResultSet.bindings[1], 1);
      });

      it('with multiple distincts', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient.distinct('info', 'info2').from('books').orderBy('author'),
          0,
          2,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select distinct `info`, `info2` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 1);
        assert.strictEqual(queryInfoCount.bindings[0], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select distinct `info`, `info2` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 1);
        assert.strictEqual(queryInfoResultSet.bindings[0], 2);
      });

      it('with multiple distincts and where clause', async () => {
        await knexUtils.paginate(
          mockedClient,
          mockedClient
            .distinct('info', 'info2')
            .from('books')
            .whereIn('title', ['title_01', 'title_02', 'title_03'])
            .orderBy('author'),
          1,
          1,
        );

        const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoCount.sql,
          'select count(*) as `count` from (select distinct `info`, `info2` from `books` where `title` in (?, ?, ?)) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCount.bindings.length, 4);
        assert.strictEqual(queryInfoCount.bindings[3], 1);

        const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoResultSet.sql,
          'select distinct `info`, `info2` from `books` where `title` in (?, ?, ?) order by `author` asc limit ? offset ?',
        );
        assert.strictEqual(queryInfoResultSet.bindings.length, 5);
        assert.strictEqual(queryInfoResultSet.bindings[3], 1);
        assert.strictEqual(queryInfoResultSet.bindings[4], 1);
      });
    });

    // ==========================================
    // paginate() and count() together
    // ==========================================
    describe('- Full example', () => {
      it('Full example', async () => {
        // ==========================================
        // SELECT query
        // ==========================================
        const query = mockedClient.select('id', 'author', 'title').from('books').orderBy('author');

        // ==========================================
        // Run as is
        // ==========================================
        await query;

        // ==========================================
        // Paginated results
        // offset 0 | limit 3
        // ==========================================
        await knexUtils.paginate(mockedClient, query, 0, 3);

        // ==========================================
        // Total count
        // ==========================================
        await knexUtils.totalCount(mockedClient, query);

        const queryInfoResultSetAsIs: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
        assert.strictEqual(
          queryInfoResultSetAsIs.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc',
        );
        assert.strictEqual(queryInfoResultSetAsIs.bindings.length, 0);

        const queryInfoCountPaginated: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
        assert.strictEqual(
          queryInfoCountPaginated.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCountPaginated.bindings.length, 1);
        assert.strictEqual(queryInfoCountPaginated.bindings[0], 1);

        const queryInfoResultSetPaginated: any = mockedClient.beforeQuerySpy.getCall(2).args[0];
        assert.strictEqual(
          queryInfoResultSetPaginated.sql,
          'select `id`, `author`, `title` from `books` order by `author` asc limit ?',
        );
        assert.strictEqual(queryInfoResultSetPaginated.bindings.length, 1);
        assert.strictEqual(queryInfoResultSetPaginated.bindings[0], 3);

        const queryInfoCountAlone: any = mockedClient.beforeQuerySpy.getCall(3).args[0];
        assert.strictEqual(
          queryInfoCountAlone.sql,
          'select count(*) as `count` from (select `id`, `author`, `title` from `books`) as `_knexSub` limit ?',
        );
        assert.strictEqual(queryInfoCountAlone.bindings.length, 1);
        assert.strictEqual(queryInfoCountAlone.bindings[0], 1);
      });
    });
  });

  // ==========================================
  // Knex mocked client
  // ==========================================
  describe('Knex mocked client', () => {
    it('default', async () => {
      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');

      const result = await query;
      assert.isOk(result);
      assert.deepEqual(result, []);
    });

    it('beforeQuerySpy spy', async () => {
      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');

      await query;

      assert.isTrue(mockedClient.beforeQuerySpy.calledOnce);

      const queryInfo: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
      assert.isOk(queryInfo);
      assert.isOk(queryInfo.sql);
      assert.isOk(queryInfo.bindings);

      assert.strictEqual(
        queryInfo.sql,
        'select `somethingA`, `somethingB` from `someTbale` where `someColumn` = ? order by `somethingB` asc',
      );
      assert.strictEqual(queryInfo.bindings.length, 1);
      assert.strictEqual(queryInfo.bindings[0], 'someValue');
    });

    it('custom result - single value', async () => {
      mockedClient.resultStub.returns(123);

      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');

      const result: any = await query;
      assert.isOk(result);
      assert.deepEqual(result, 123);
    });

    it('custom result - object', async () => {
      mockedClient.resultStub.returns({
        name: 'toto',
      });

      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');

      const result: any = await query;
      assert.isOk(result);
      assert.deepEqual(result, {
        name: 'toto',
      });
    });

    it('custom result - array', async () => {
      mockedClient.resultStub.returns([
        {
          name: 'toto',
        },
        {
          name: 'titi',
        },
      ]);

      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');

      const result = await query;
      assert.isOk(result);
      assert.deepEqual(result, [
        {
          name: 'toto',
        },
        {
          name: 'titi',
        },
      ]);
    });

    it('pagination - default', async () => {
      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');

      const paginatedResult = await knexUtils.paginate(mockedClient, query, 0, 10);
      assert.isTrue(isPaginatedResult(paginatedResult));

      assert.strictEqual(paginatedResult.paging.offset, 0);
      assert.strictEqual(paginatedResult.paging.limit, 10);
      assert.strictEqual(paginatedResult.paging.totalCount, 0);
      assert.strictEqual(paginatedResult.items.length, 0);
    });

    it('pagination - custom totalCount', async () => {
      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');
      mockedClient.totalCountStub.returns(123);

      const paginatedResult = await knexUtils.paginate(mockedClient, query, 0, 10);
      assert.isTrue(isPaginatedResult(paginatedResult));

      assert.strictEqual(paginatedResult.paging.offset, 0);
      assert.strictEqual(paginatedResult.paging.limit, 10);
      assert.strictEqual(paginatedResult.paging.totalCount, 123);
      assert.strictEqual(paginatedResult.items.length, 0);
    });

    it('pagination - full example', async () => {
      mockedClient.resultStub.returns([
        {
          name: 'toto',
        },
        {
          name: 'titi',
        },
      ]);

      const query = mockedClient
        .select('somethingA', 'somethingB')
        .from('someTbale')
        .where('someColumn', 'someValue')
        .orderBy('somethingB');
      mockedClient.totalCountStub.returns(123);

      const paginatedResult = await knexUtils.paginate(mockedClient, query, 3, 7);
      assert.isTrue(isPaginatedResult(paginatedResult));

      assert.strictEqual(paginatedResult.paging.offset, 3);
      assert.strictEqual(paginatedResult.paging.limit, 7);
      assert.strictEqual(paginatedResult.paging.totalCount, 123);
      assert.strictEqual(paginatedResult.items.length, 2);

      assert.deepEqual(paginatedResult.items, [
        {
          name: 'toto',
        },
        {
          name: 'titi',
        },
      ]);

      assert.isTrue(mockedClient.beforeQuerySpy.calledTwice);

      const queryInfo: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
      assert.isOk(queryInfo);
      assert.isOk(queryInfo.sql);
      assert.isOk(queryInfo.bindings);

      const queryInfoCount: any = mockedClient.beforeQuerySpy.getCall(0).args[0];
      assert.strictEqual(
        queryInfoCount.sql,
        'select count(*) as `count` from (select `somethingA`, `somethingB` from `someTbale` where `someColumn` = ?) as `_knexSub` limit ?',
      );
      assert.strictEqual(queryInfoCount.bindings.length, 2);
      assert.strictEqual(queryInfoCount.bindings[1], 1);

      const queryInfoResultSet: any = mockedClient.beforeQuerySpy.getCall(1).args[0];
      assert.strictEqual(
        queryInfoResultSet.sql,
        'select `somethingA`, `somethingB` from `someTbale` where `someColumn` = ? order by `somethingB` asc limit ? offset ?',
      );
      assert.strictEqual(queryInfoResultSet.bindings.length, 3);
      assert.strictEqual(queryInfoResultSet.bindings[1], 7);
      assert.strictEqual(queryInfoResultSet.bindings[2], 3);
    });

    it('transaction - select', async () => {
      mockedClient.resultStub.returns(123);

      await mockedClient.transaction(async (trx) => {
        const query = trx
          .select('somethingA', 'somethingB')
          .from('someTbale')
          .where('someColumn', 'someValue')
          .orderBy('somethingB');

        const result: any = await query;
        assert.isOk(result);
        assert.deepEqual(result, 123);
      });
    });

    it('transaction - update', async () => {
      mockedClient.resultStub.returns(123);

      await mockedClient.transaction(async (trx) => {
        const query = trx('someTable')
          .update({
            someColumn: 'someValue2',
          })
          .where('someColumn', 'someValue');

        const result: any = await query;
        assert.isOk(result);
        assert.deepEqual(result, 123);
      });
    });

    it('transaction - insert', async () => {
      mockedClient.resultStub.returns(123);

      await mockedClient.transaction(async (trx) => {
        const query = trx('someTable')
          .insert({
            someColumn: 'someValue2',
          })
          .returning('someColumn');

        const result: any = await query;
        assert.isOk(result);
        assert.deepEqual(result, 123);
      });
    });
  });

  // ==========================================
  // wrapWithOracleModificationkeywords
  // ==========================================
  describe('- wrapWithOracleModificationkeywords()', () => {
    it('no convert, no lower', async () => {
      let result = knexUtils.wrapWithOracleModificationkeywords('test', false, false);
      assert.strictEqual(result, 'test');

      result = knexUtils.wrapWithOracleModificationkeywords('?', false, false);
      assert.strictEqual(result, '?');
    });

    it('convert, no lower', async () => {
      let result = knexUtils.wrapWithOracleModificationkeywords('test', true, false);
      assert.strictEqual(result, "CONVERT(test, 'US7ASCII', 'WE8ISO8859P1')");

      result = knexUtils.wrapWithOracleModificationkeywords('?', true, false);
      assert.strictEqual(result, "CONVERT(?, 'US7ASCII', 'WE8ISO8859P1')");
    });

    it('no convert, lower', async () => {
      let result = knexUtils.wrapWithOracleModificationkeywords('test', false, true);
      assert.strictEqual(result, 'LOWER(test)');

      result = knexUtils.wrapWithOracleModificationkeywords('?', false, true);
      assert.strictEqual(result, 'LOWER(?)');
    });

    it('convert, lower', async () => {
      let result = knexUtils.wrapWithOracleModificationkeywords('test', true, true);
      assert.strictEqual(result, "LOWER(CONVERT(test, 'US7ASCII', 'WE8ISO8859P1'))");

      result = knexUtils.wrapWithOracleModificationkeywords('?', true, true);
      assert.strictEqual(result, "LOWER(CONVERT(?, 'US7ASCII', 'WE8ISO8859P1'))");
    });
  });

  // ==========================================
  // addOracleLikeClause
  // ==========================================
  describe('- addOracleLikeClause()', () => {
    let queryBuilder: Knex.QueryBuilder;

    beforeEach(async () => {
      queryBuilder = mockedClient.select('titi');
    });

    it('no convert, no lower, no wildcard', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val', false, false);
      assert.strictEqual(result.toQuery(), "select `titi` where `test` = 'val'");
    });

    it('no convert, no lower, wildcard left', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val', false, false);
      assert.strictEqual(result.toQuery(), "select `titi` where test LIKE '%' || 'val'");
    });

    it('no convert, no lower, wildcard right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val*', false, false);
      assert.strictEqual(result.toQuery(), "select `titi` where test LIKE 'val' || '%'");
    });

    it('no convert, no lower, wildcard left right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val*', false, false);
      assert.strictEqual(result.toQuery(), "select `titi` where test LIKE '%' || 'val' || '%'");
    });

    // ---

    it('convert, no lower, no wildcard', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val', true, false);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where CONVERT(test, 'US7ASCII', 'WE8ISO8859P1') LIKE CONVERT('val', 'US7ASCII', 'WE8ISO8859P1')",
      );
    });

    it('convert, no lower, wildcard left', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val', true, false);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where CONVERT(test, 'US7ASCII', 'WE8ISO8859P1') LIKE '%' || CONVERT('val', 'US7ASCII', 'WE8ISO8859P1')",
      );
    });

    it('convert, no lower, wildcard right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val*', true, false);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where CONVERT(test, 'US7ASCII', 'WE8ISO8859P1') LIKE CONVERT('val', 'US7ASCII', 'WE8ISO8859P1') || '%'",
      );
    });

    it('convert, no lower, wildcard left right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val*', true, false);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where CONVERT(test, 'US7ASCII', 'WE8ISO8859P1') LIKE '%' || CONVERT('val', 'US7ASCII', 'WE8ISO8859P1') || '%'",
      );
    });

    // ---

    it('no convert, lower, no wildcard', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val', false, true);
      assert.strictEqual(result.toQuery(), "select `titi` where LOWER(test) LIKE LOWER('val')");
    });

    it('no convert, lower, wildcard left', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val', false, true);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where LOWER(test) LIKE '%' || LOWER('val')",
      );
    });

    it('no convert, lower, wildcard right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val*', false, true);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where LOWER(test) LIKE LOWER('val') || '%'",
      );
    });

    it('no convert, lower, wildcard left right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val*', false, true);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where LOWER(test) LIKE '%' || LOWER('val') || '%'",
      );
    });

    // ---

    it('convert, lower, no wildcard', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val', true, true);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where LOWER(CONVERT(test, 'US7ASCII', 'WE8ISO8859P1')) LIKE LOWER(CONVERT('val', 'US7ASCII', 'WE8ISO8859P1'))",
      );
    });

    it('convert, lower, wildcard left', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val', true, true);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where LOWER(CONVERT(test, 'US7ASCII', 'WE8ISO8859P1')) LIKE '%' || LOWER(CONVERT('val', 'US7ASCII', 'WE8ISO8859P1'))",
      );
    });

    it('convert, lower, wildcard right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', 'val*', true, true);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where LOWER(CONVERT(test, 'US7ASCII', 'WE8ISO8859P1')) LIKE LOWER(CONVERT('val', 'US7ASCII', 'WE8ISO8859P1')) || '%'",
      );
    });

    it('convert, lower, wildcard left right', async () => {
      const result = knexUtils.addOracleLikeClause(queryBuilder, 'test', '*val*', true, true);
      assert.strictEqual(
        result.toQuery(),
        "select `titi` where LOWER(CONVERT(test, 'US7ASCII', 'WE8ISO8859P1')) LIKE '%' || LOWER(CONVERT('val', 'US7ASCII', 'WE8ISO8859P1')) || '%'",
      );
    });
  });

  // ==========================================
  // wrapWithSqlServerModificationKeywords
  // ==========================================
  describe('- wrapWithSqlServerModificationKeywords()', () => {
    it('no convert, no lower', async () => {
      let result = knexUtils.wrapWithSqlServerModificationKeywords('test', false, false);
      assert.strictEqual(result, 'test');

      result = knexUtils.wrapWithSqlServerModificationKeywords('?', false, false);
      assert.strictEqual(result, '?');
    });

    it('convert, no lower', async () => {
      let result = knexUtils.wrapWithSqlServerModificationKeywords('test', true, false);
      assert.strictEqual(
        result,
        `CAST(` +
          `REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')` +
          `AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS`,
      );

      result = knexUtils.wrapWithSqlServerModificationKeywords('?', true, false);
      assert.strictEqual(
        result,
        `CAST(` +
          `REPLACE(REPLACE(REPLACE(REPLACE(?, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')` +
          `AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS`,
      );
    });

    it('no convert, lower', async () => {
      let result = knexUtils.wrapWithSqlServerModificationKeywords('test', false, true);
      assert.strictEqual(result, 'LOWER(test)');

      result = knexUtils.wrapWithSqlServerModificationKeywords('?', false, true);
      assert.strictEqual(result, 'LOWER(?)');
    });

    it('convert, lower', async () => {
      let result = knexUtils.wrapWithSqlServerModificationKeywords('test', true, true);
      assert.strictEqual(
        result,
        `LOWER(CAST(` +
          `REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')` +
          `AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS)`,
      );

      result = knexUtils.wrapWithSqlServerModificationKeywords('?', true, true);
      assert.strictEqual(
        result,
        `LOWER(CAST(` +
          `REPLACE(REPLACE(REPLACE(REPLACE(?, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')` +
          `AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS)`,
      );
    });
  });

  // ==========================================
  // addSqlServerLikeClause
  // ==========================================
  describe('- addSqlServerLikeClause()', () => {
    let queryBuilder: Knex.QueryBuilder;

    beforeEach(async () => {
      queryBuilder = mockedClient.select('titi');
    });

    describe('- wildcards allowed', () => {
      it('no convert, no lower, no wildcard', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val',
          true,
          false,
          false,
        );
        assert.strictEqual(result.toQuery(), "select `titi` where `test` = 'val'");
      });

      it('no convert, no lower, wildcard left', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val',
          true,
          false,
          false,
        );
        assert.strictEqual(result.toQuery(), "select `titi` where test LIKE '%' + 'val'");
      });

      it('no convert, no lower, wildcard right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val*',
          true,
          false,
          false,
        );
        assert.strictEqual(result.toQuery(), "select `titi` where test LIKE 'val' + '%'");
      });

      it('no convert, no lower, wildcard left right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val*',
          true,
          false,
          false,
        );
        assert.strictEqual(result.toQuery(), "select `titi` where test LIKE '%' + 'val' + '%'");
      });

      // ---

      it('convert, no lower, no wildcard', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val',
          true,
          true,
          false,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS ' +
            'LIKE CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS',
        );
      });

      it('convert, no lower, wildcard left', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val',
          true,
          true,
          false,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS ' +
            "LIKE '%' + CAST(" +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS',
        );
      });

      it('convert, no lower, wildcard right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val*',
          true,
          true,
          false,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS ' +
            'LIKE CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            "AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS + '%'",
        );
      });

      it('convert, no lower, wildcard left right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val*',
          true,
          true,
          false,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS ' +
            "LIKE '%' + CAST(" +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            "AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS + '%'",
        );
      });

      // ---

      it('no convert, lower, no wildcard', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val',
          true,
          false,
          true,
        );
        assert.strictEqual(result.toQuery(), "select `titi` where LOWER(test) LIKE LOWER('val')");
      });

      it('no convert, lower, wildcard left', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val',
          true,
          false,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          "select `titi` where LOWER(test) LIKE '%' + LOWER('val')",
        );
      });

      it('no convert, lower, wildcard right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val*',
          true,
          false,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          "select `titi` where LOWER(test) LIKE LOWER('val') + '%'",
        );
      });

      it('no convert, lower, wildcard left right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val*',
          true,
          false,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          "select `titi` where LOWER(test) LIKE '%' + LOWER('val') + '%'",
        );
      });

      // ---

      it('convert, lower, no wildcard', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val',
          true,
          true,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS) ' +
            'LIKE LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS)',
        );
      });

      it('convert, lower, wildcard left', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val',
          true,
          true,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS) ' +
            "LIKE '%' + LOWER(CAST(" +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS)',
        );
      });

      it('convert, lower, wildcard right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          'val*',
          true,
          true,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS) ' +
            'LIKE LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            "AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS) + '%'",
        );
      });

      it('convert, lower, wildcard left right', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val*',
          true,
          true,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS) ' +
            "LIKE '%' + LOWER(CAST(" +
            "REPLACE(REPLACE(REPLACE(REPLACE('val', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            "AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS) + '%'",
        );
      });
    });

    describe('- no wildcards allowed', () => {
      it('no convert, no lower, no wildcard', async () => {
        const result = knexUtils.addSqlServerLikeClause(
          queryBuilder,
          'test',
          '*val*',
          false,
          true,
          true,
        );
        assert.strictEqual(
          result.toQuery(),
          'select `titi` where LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE(test, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS) ' +
            'LIKE LOWER(CAST(' +
            "REPLACE(REPLACE(REPLACE(REPLACE('*val*', 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')" +
            'AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS)',
        );
      });
    });
  });
});
