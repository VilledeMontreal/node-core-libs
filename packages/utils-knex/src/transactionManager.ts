import { Knex } from 'knex';
import * as _ from 'lodash';
import { IDatabaseContext } from './databaseContext';

/**
 * A Knex manager that allows nested transactions.
 * Instead of using a knex client directly, always use
 * the "withClient()" and "withTransaction()" provided here...
 * This will make sure that if the query is called inside an
 * already started transaction, it will be part of it.
 */
export class KnexTransactionManager {
  private getClientFnt: () => Promise<Knex>;

  /**
   * @param getClientFnt a function to return the
   * knex client to use.
   */
  constructor(getClientFnt: () => Promise<Knex>) {
    this.getClientFnt = getClientFnt;
  }

  /**
   * Provides a knex client to run queries that need an explicit
   * transaction. If a transaction is already started when this
   * function is called, the same transaction will be used.
   */
  public async withTransaction<T>(
    context: IDatabaseContext,
    fnt: (client: Knex) => Promise<T>,
  ): Promise<T> {
    return await this.withClient(context, fnt, true);
  }

  /**
   * Provides a knex client to run queries that don't need an explicit
   * transaction. But if a transaction is already started when this
   * function is called, the queries will be part of the transaction.
   */
  public async withClient<T>(
    context: IDatabaseContext,
    fnt: (client: Knex) => Promise<T>,
    transactional = false,
  ): Promise<T> {
    let contextClean = context;
    if (_.isNil(contextClean)) {
      contextClean = {
        currentKnexClient: null,
      };
    }

    const existingClient: Knex = contextClean.currentKnexClient;

    if (existingClient && existingClient.name !== 'knex') {
      throw new Error(
        `This manager requires a *knex* client to be passed in the database context! Currently : ${JSON.stringify(
          existingClient,
          null,
          2,
        )}`,
      );
    }

    if (existingClient && (!transactional || this.isTransactionClient(existingClient))) {
      return await fnt(existingClient);
    }

    const client = await this.getClientFnt();
    if (transactional) {
      return await client.transaction(async (trx) => {
        contextClean.currentKnexClient = trx;
        try {
          return await fnt(trx as any);
        } finally {
          contextClean.currentKnexClient = existingClient;
        }
      });
    }

    contextClean.currentKnexClient = client;
    try {
      return await fnt(client);
    } finally {
      contextClean.currentKnexClient = existingClient;
    }
  }

  /**
   * "knex.Transaction" type guard.
   */
  protected isTransactionClient = (client: any): client is Knex.Transaction => {
    return client && 'commit' in client && 'rollback' in client;
  };
}
