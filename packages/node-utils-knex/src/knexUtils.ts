// ==========================================
// Knex utilities
// ==========================================
import { IPaginatedResult, utils } from '@villedemontreal/general-utils';
import { Promise as BBPromise } from 'bluebird';
import knex, { Knex } from 'knex';
import * as _ from 'lodash';
import * as sinon from 'sinon';
import { v4 as uuid } from 'uuid';
import { createLogger } from './utils/logger';

const logger = createLogger('knexUtils');

/**
 * Knex utilities
 */
export class KnexUtils {
  protected static KNEX_TOTAL_COUNT_QUERY_COLUMN_NAME = 'count';
  protected static TOTAL_COUNT_BUILDER_OPTION_NAME = 'isTotalCountBuilder';

  /**
   * Takes a Knex.QueryBuilder, which is the object created
   * when defining a Knex query, an returns the rows total count.
   *
   * This function is useful when you already have a SELECT Knex query,
   * but you only need the rows total count instead of the rows themselves!
   *
   * Warning!! This function only works with SELECT queries, and
   * may fail in some untested complex situations... It only has
   * been tested with simple select/from/where/orderBy queries.
   *
   * Example :
   *
   * const queryBuilder = client
   *       .from(BOOKS_TABLE_NAME)
   *       .orderBy("author");
   *
   * ... and then, instead of executing the query, by using
   * "then()" or "await", you pass the builder to the
   * "totalCount()" function :
   *
   * let totalCount: number = await knexUtils.totalCount(client, queryBuilder);
   *
   */
  public async totalCount(knex: Knex, selectBuilder: Knex.QueryBuilder): Promise<number> {
    const result = await this.paginateOrTotalCount(knex, selectBuilder, -1, -1, true);
    return result.paging.totalCount;
  }

  /**
   * Takes a Knex.QueryBuilder, which is the object created
   * when defining a Knex query, a limit and a current
   * page, then return a IPaginatedResult.
   *
   * In other words, instead of executing the query you
   * are building with Knex directly, you pass the unsent
   * builder to this function and you get :
   * - Pagination for your query
   * - The total number of elements your query would return if it
   *   wasn't paginated.
   *
   * Warning!! This function only works with SELECT queries, and
   * may fail in some untested complex situations... It only has
   * been tested with simple select/from/where/orderBy queries.
   *
   * If this function fails for one of your query, you'll have to
   * duplicate the code of that query to make two separate queries :
   * one for the rows only and one for the total count only.
   *
   * For example, to get 3 items starting at offset 9 :
   *
   *  const paginatedResult = await knexUtils.paginate(
   *    client,
   *    client
   *      .select("id", "author", "title")
   *      .from(BOOKS_TABLE_NAME)
   *      .orderBy("author"),
   *    9, 3);
   */
  public async paginate(
    knex: Knex,
    selectBuilder: Knex.QueryBuilder,
    offset: number,
    limit: number,
  ): Promise<IPaginatedResult<any>> {
    const result = await this.paginateOrTotalCount(knex, selectBuilder, offset, limit);
    return result;
  }

  /**
   * Creates a mocked Knex client, linked to a dummy database.
   * The client allows you to define stubs that will simulate
   * the result from the DB.
   *
   * Useful for testing!
   */
  public createKnexMockedClient = async (): Promise<IKnexMockedClient> => {
    const knexMockedClient: IKnexMockedClient = knex({
      client: 'better-sqlite3',
      connection: {
        filename: './mydb.sqlite',
      },
      useNullAsDefault: true,
    }) as any;

    // ==========================================
    // We add stubs that will allow to change the
    // mocked result of a query.
    // ==========================================
    knexMockedClient.resultStub = sinon.stub();
    knexMockedClient.resultStub.returns([]);

    knexMockedClient.totalCountStub = sinon.stub();
    knexMockedClient.totalCountStub.returns(0);

    knexMockedClient.beforeQuerySpy = sinon.spy();

    // ==========================================
    // Returns a dummy connection object
    // ==========================================
    knexMockedClient.client.acquireConnection = () => {
      // ==========================================
      // We have to use a BlueBird Promise because
      // this is what Knex is expecting and some functions
      // specific to BlueBird promises are called.
      // ==========================================
      const promiseLike = new BBPromise((resolve: any) => {
        resolve({
          // The "__knexUid" property is required by Knex
          __knexUid: uuid(),
        });
      });
      return promiseLike;
    };

    // ==========================================
    // Called when the query is actually executed
    // by Knex. We simply return the values from
    // our stubs!
    // ==========================================
    knexMockedClient.client.query = (knexUuid: string, builder: any) => {
      // The spy...
      knexMockedClient.beforeQuerySpy(builder);

      // ==========================================
      // Query for the "totalCount" part of our "paginate()"
      // function... We return the value from the
      // *totalCount stub*.
      // ==========================================
      if (builder.options && builder.options[KnexUtils.TOTAL_COUNT_BUILDER_OPTION_NAME]) {
        const theResult = knexMockedClient.totalCountStub();
        const resultRow = {};
        (resultRow as any)[KnexUtils.KNEX_TOTAL_COUNT_QUERY_COLUMN_NAME] = theResult;
        return Promise.resolve(resultRow);
      }

      // ==========================================
      // Regular query
      // ==========================================

      // The stub....
      const result = knexMockedClient.resultStub();
      return Promise.resolve(result);
    };

    // ==========================================
    // Called by Knex to transform the result returned
    // by the DB. We return our mocked result as is...
    // ==========================================
    knexMockedClient.client.processResponse = (obj: any) => {
      return obj;
    };

    // ==========================================
    // When using a transaction, a new "client"
    // is created. We replace it by our mocked client.
    // ==========================================
    (knexMockedClient as any)['context'].transaction = (transactionScope?: null) => {
      return transactionScope !== null ? (transactionScope as any)(knexMockedClient) : undefined;
    };

    return knexMockedClient;
  };

  /**
   * For Oracle.
   * Wraps a column name (or a "?") with LOWER or with a CONVERT function
   * which will strip accents.
   */
  public wrapWithOracleModificationkeywords(
    columnNameOrInterrogationMark: string,
    isConvert: boolean,
    isLower: boolean,
  ): string {
    if (isConvert && isLower) {
      return `LOWER(CONVERT(${columnNameOrInterrogationMark}, 'US7ASCII', 'WE8ISO8859P1'))`;
    }
    if (isConvert) {
      return `CONVERT(${columnNameOrInterrogationMark}, 'US7ASCII', 'WE8ISO8859P1')`;
    }
    if (isLower) {
      return `LOWER(${columnNameOrInterrogationMark})`;
    }
    return columnNameOrInterrogationMark;
  }

  /**
   * For Oracle.
   * Adds a LIKE clause, where the values can be compared lowercased (isLower), by removing the
   * accents first (isConvert), and where the "val" can starts or ends with a "*" wildcard.
   */
  public addOracleLikeClause(
    queryBuilder: Knex.QueryBuilder,
    columnName: string,
    val: string,
    isConvert: boolean,
    isLower: boolean,
  ): Knex.QueryBuilder {
    let valClean = val;
    let wildcardPrefix = '';
    let wildcardSuffix = '';
    if (val.startsWith('*')) {
      wildcardPrefix = "'%' || ";
      valClean = _.trimStart(valClean, '*');
    }
    if (valClean.endsWith('*')) {
      wildcardSuffix = " || '%'";
      valClean = _.trimEnd(valClean, '*');
    }

    let queryBuilderClean = queryBuilder;
    if (wildcardPrefix === '' && wildcardSuffix === '' && !isConvert && !isLower) {
      queryBuilderClean = queryBuilderClean.where(columnName, valClean);
    } else {
      const clause = `${this.wrapWithOracleModificationkeywords(
        columnName,
        isConvert,
        isLower,
      )} LIKE ${wildcardPrefix}${this.wrapWithOracleModificationkeywords(
        '?',
        isConvert,
        isLower,
      )}${wildcardSuffix}`;
      queryBuilderClean = queryBuilderClean.whereRaw(clause, valClean);
    }

    return queryBuilderClean;
  }

  /**
   * For SQL Server.
   * Wraps a column name (or a "?") with LOWER and/or with a CAST function
   * which will strip accents.
   */
  public wrapWithSqlServerModificationKeywords(
    columnNameOrInterrogationMark: string,
    isConvert: boolean,
    isLower: boolean,
  ): string {
    if (!isLower && !isConvert) {
      return columnNameOrInterrogationMark;
    }

    if (isLower && !isConvert) {
      return `LOWER(${columnNameOrInterrogationMark})`;
    }

    // ==========================================
    // There is no magic method in SQL Server to strip accents.
    // This is the best I found : https://stackoverflow.com/a/3578644/843699
    // ... I added "œ" and "æ" management too, which don't work with the
    // Stack Overflow trick.
    // ==========================================
    const cast =
      `CAST(` +
      `REPLACE(REPLACE(REPLACE(REPLACE(${columnNameOrInterrogationMark}, 'œ', 'oe'), 'Œ', 'OE'), 'æ', 'ae'), 'Æ', 'AE')` +
      `AS VARCHAR(max)) COLLATE SQL_Latin1_General_Cp1251_CS_AS`;

    if (!isLower) {
      return cast;
    }
    return `LOWER(${cast})`;
  }

  /**
   * For SQL Server.
   * Adds a LIKE clause, where the values can be compared lowercased (lower), by removing the
   * accents first (removeAccent), and where the "val" can starts or ends with a "*" wildcard
   * (acceptWildcard).
   */
  public addSqlServerLikeClause(
    queryBuilder: Knex.QueryBuilder,
    columnName: string,
    val: string,
    acceptWildcard: boolean,
    removeAccents: boolean,
    lower: boolean,
  ): Knex.QueryBuilder {
    let valClean = val;
    let wildcardPrefix = '';
    let wildcardSuffix = '';

    if (acceptWildcard) {
      if (val.startsWith('*')) {
        wildcardPrefix = "'%' + ";
        valClean = _.trimStart(valClean, '*');
      }
      if (valClean.endsWith('*')) {
        wildcardSuffix = " + '%'";
        valClean = _.trimEnd(valClean, '*');
      }
    }

    let queryBuilderClean = queryBuilder;
    if (wildcardPrefix === '' && wildcardSuffix === '' && !removeAccents && !lower) {
      queryBuilderClean = queryBuilderClean.where(columnName, valClean);
    } else {
      const clause = `${this.wrapWithSqlServerModificationKeywords(
        columnName,
        removeAccents,
        lower,
      )} LIKE ${wildcardPrefix}${this.wrapWithSqlServerModificationKeywords(
        '?',
        removeAccents,
        lower,
      )}${wildcardSuffix}`;
      queryBuilderClean = queryBuilderClean.whereRaw(clause, valClean);
    }

    return queryBuilderClean;
  }

  /**
   * @param totalCountOnly if true, only the request to get the total count will
   * be made and an empty array will be returned as the rows.
   */
  protected async paginateOrTotalCount(
    knex: Knex,
    selectBuilder: Knex.QueryBuilder,
    offset: number,
    limit: number,
    totalCountOnly = false,
  ): Promise<IPaginatedResult<any>> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (!selectBuilder) {
      throw new Error('A Knex SELECT query builder is required.');
    }

    if ((selectBuilder as any)['_method'] !== 'select') {
      throw new Error(
        "The 'paginate()' and 'totalCount()' functions are only available on a SELECT query builder!",
      );
    }

    let offsetClean = offset;
    if (!utils.isIntegerValue(offsetClean, true, true)) {
      logger.debug(`Invalid offset "${offsetClean}", 0 will be used instead`);
      offsetClean = 0;
    }
    offsetClean = Number(offsetClean);
    let limitClean = limit;
    if (!utils.isIntegerValue(limitClean, true, false)) {
      logger.debug(`Invalid limit "${limitClean}", 1 will be used instead`);
      limitClean = 1;
    }
    limitClean = Number(limitClean);

    // ==========================================
    // We wrap the original select query in a
    // "count()" query. We also add an option to this
    // new query so we can later know this is the "totalCount"
    // generated query.
    // ==========================================
    let countBuilder = knex.count(`* AS ${KnexUtils.KNEX_TOTAL_COUNT_QUERY_COLUMN_NAME}`);
    const options: any = {};
    options[KnexUtils.TOTAL_COUNT_BUILDER_OPTION_NAME] = true;
    countBuilder = countBuilder.options(options);

    // ==========================================
    // For the subquery, we clone the
    // original query but remove the "order by"
    // clause, the limit and the offset.
    // ==========================================
    const countBuilderSubSelect: Knex.QueryBuilder = selectBuilder.clone();
    delete (countBuilderSubSelect as any)['_single'].offset;
    delete (countBuilderSubSelect as any)['_single'].limit;
    if ((countBuilderSubSelect as any)['_statements']) {
      const totalCountStatements = [];
      for (const statement of (countBuilderSubSelect as any)['_statements']) {
        if (statement.grouping !== 'order') {
          totalCountStatements.push(statement);
        }
      }
      (countBuilderSubSelect as any)['_statements'] = totalCountStatements;
    }
    countBuilder = countBuilder.from(countBuilderSubSelect.as('_knexSub') as any);

    // ==========================================
    // Are we simply interested in the total count,
    // or the actual rows too?
    // We do not use something like Promise.all() to
    // run both queries because of :
    // https://github.com/tediousjs/node-mssql/issues/491
    // ==========================================
    const rs = await countBuilder.first();
    const totalCount = Number(rs[KnexUtils.KNEX_TOTAL_COUNT_QUERY_COLUMN_NAME]);

    let rows: any[];
    if (!totalCountOnly) {
      rows = await selectBuilder.offset(offsetClean).limit(limitClean);
    }

    const result: IPaginatedResult<any> = {
      items: rows,
      paging: {
        totalCount,
        limit: limitClean,
        offset: offsetClean,
      },
    };

    return result;
  }
}
export const knexUtils: KnexUtils = new KnexUtils();

/**
 * A Mocked Knex client.
 */
export interface IKnexMockedClient extends Knex {
  /**
   * The stub that is going to return the result
   * when the query is executed.
   *
   * Defaults to an empty array.
   */
  resultStub: sinon.SinonStub;

  /**
   * If the query is paginated, this stub
   * will return the "totalCount" part of
   * the result.
   *
   * Defaults to 0.
   */
  totalCountStub: sinon.SinonStub;

  /**
   * This spy is going to be called just before
   * Knex actually execute the query. The builder
   * has at this point been converted to a
   * SQL string and you have access to this SQL and
   * other informations.
   */
  beforeQuerySpy: sinon.SinonSpy;
}
