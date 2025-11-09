import { Knex } from 'knex';

/**
 * A Context that can be used to get the current database
 * client, if any. This allows the use of nested transactions.
 */
export interface IDatabaseContext {
  currentKnexClient?: Knex;
}
