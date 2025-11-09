// ==========================================
// Disabling some linting rules is OK in test files.
// tslint:disable:max-func-body-length
// tslint:disable:cyclomatic-complexity
// tslint:disable:no-string-literal
// ==========================================
import { assert } from 'chai';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import { destroyTestKnexClient, getTestTransactionManager } from '../testing/testClient';
import { testRepo } from '../testing/testRepo';
import { IDatabaseContext } from './databaseContext';
import { KnexTransactionManager } from './transactionManager';

export interface ITestContext extends IDatabaseContext {
  executionId: string;
}

export interface ITestUser {
  id: number;
  firstName: string;
  lastName: string;
}

async function createUsersTable(knexClient: Knex) {
  await knexClient.schema.createTable(`users`, async (table) => {
    table.increments('id').primary();
    table.string('firstName', 256).notNullable();
    table.string('lastName', 256).notNullable();
  });
}

describe(`Transactions Manager tests`, () => {
  let testContext: ITestContext;

  before(async () => {
    // ==========================================
    // We create an initial "context". In an API
    // project, this would probably be done in
    // a controller. The controller would then
    // pass this context to all methods called
    // on services and, indirectly, on repositories.
    // ==========================================
    testContext = {
      currentKnexClient: null,
      executionId: uuid(),
    } as ITestContext;

    // ==========================================
    // Create the "users" table
    // ==========================================
    await withTransaction(testContext, async (client: Knex.Transaction) => {
      await createUsersTable(client);
    });
  });

  after(async () => {
    await destroyTestKnexClient();
  });

  async function withClient<T>(context: IDatabaseContext, fnt: (client: Knex) => Promise<T>) {
    const txManager: KnexTransactionManager = await getTestTransactionManager();
    return txManager.withClient<T>(context, fnt);
  }

  async function withTransaction<T>(context: IDatabaseContext, fnt: (client: Knex) => Promise<T>) {
    const txManager: KnexTransactionManager = await getTestTransactionManager();
    return txManager.withTransaction<T>(context, fnt);
  }

  async function getUserById(id: number): Promise<ITestUser> {
    return await withClient(testContext, async (client: Knex.Transaction) => {
      const res = await client.select('id', 'firstName', 'lastName').from(`users`).where(`id`, id);

      return {
        id: res[0].id,
        firstName: res[0].firstName,
        lastName: res[0].lastName,
      };
    });
  }

  let userId: number;
  it(`insert a user`, async () => {
    // ==========================================
    // Here we use "withClient" not "withTransaction"
    // since we do not need a transaction. We
    // *could* start a transaction even if it's
    // not required, it would still work, but it
    // is more costy...
    // ==========================================
    await withClient(testContext, async (client: Knex.Transaction) => {
      const res = await client(`users`).insert({
        firstName: 'Stromgol',
        lastName: 'LaRoche',
      } as ITestUser);
      userId = res[0];
    });

    const user: ITestUser = await getUserById(userId);
    assert.isOk(user);
    assert.deepEqual(user.id, userId);
    assert.deepEqual(user.firstName, 'Stromgol');
    assert.deepEqual(user.lastName, 'LaRoche');
  });

  it(`Modifiy the lastName - not in a trasaction - succes`, async () => {
    await withClient(testContext, async (client: Knex.Transaction) => {
      await client(`users`)
        .update({
          lastName: 'LaPierre',
        })
        .where(`id`, userId);

      await client(`users`)
        .update({
          lastName: 'Stone',
        })
        .where(`id`, userId);
    });

    const user: ITestUser = await getUserById(userId);
    assert.deepEqual(user.lastName, 'Stone');
  });

  it(`Modifiy the lastName - not in a trasaction - error in the second query`, async () => {
    let error;
    try {
      await withClient(testContext, async (client: Knex.Transaction) => {
        await client(`users`)
          .update({
            lastName: 'Caillou',
          })
          .where(`id`, userId);

        await client(`NOPE`) // invalid table name
          .update({
            lastName: 'Roquaille',
          })
          .where(`id`, userId);
      });
    } catch (err) {
      error = err;
    }
    if (!error) {
      assert.fail();
    }

    // ==========================================
    // Has been modified, even if there was an error
    // in the second query!
    // ==========================================
    const user: ITestUser = await getUserById(userId);
    assert.deepEqual(user.lastName, 'Caillou');
  });

  it(`modifiy the lastName - in a trasaction - error in the second query`, async () => {
    let error;
    try {
      await withTransaction(testContext, async (client: Knex.Transaction) => {
        await client(`users`)
          .update({
            lastName: 'Sable',
          })
          .where(`id`, userId);

        await client(`NOPE`) // invalid table name
          .update({
            lastName: 'Galet',
          })
          .where(`id`, userId);
      });
    } catch (err) {
      error = err;
    }
    if (!error) {
      assert.fail();
    }

    // ==========================================
    // Not modified! The transaction has been aborted.
    // ==========================================
    const user: ITestUser = await getUserById(userId);
    assert.deepEqual(user.lastName, 'Caillou');
  });

  it(`Transaction working even when executing a query in another file/class, by passing the "context" - no error`, async () => {
    await withTransaction(testContext, async (client: Knex.Transaction) => {
      await client(`users`)
        .update({
          lastName: 'Tremblay',
        })
        .where(`id`, userId);

      // ==========================================
      // Execute a query in another file/class, always
      // by passing the current "context".
      // ==========================================
      await testRepo.changeFirstName(testContext, userId, 'Georges');
    });

    // ==========================================
    // Modified!
    // ==========================================
    const user: ITestUser = await getUserById(userId);
    assert.deepEqual(user.firstName, 'Georges');
    assert.deepEqual(user.lastName, 'Tremblay');
  });

  it(`Transaction working (so aborted) when executing a query in another file/class that generates an error`, async () => {
    let error;
    try {
      await withTransaction(testContext, async (client: Knex.Transaction) => {
        await client(`users`)
          .update({
            lastName: 'Lapointe',
          })
          .where(`id`, userId);

        // ==========================================
        // Execute a query in another file/class. This
        // generated an error which must rollback the
        // transaction!
        // ==========================================
        await testRepo.generateSqlError(testContext);
      });
    } catch (err) {
      error = err;
    }
    if (!error) {
      assert.fail();
    }

    // ==========================================
    // Not modified! The transaction has been aborted.
    // ==========================================
    const user: ITestUser = await getUserById(userId);
    assert.deepEqual(user.firstName, 'Georges');
    assert.deepEqual(user.lastName, 'Tremblay');
  });

  it(`Transaction rollbacked in a regular Error too`, async () => {
    let error;
    try {
      await withTransaction(testContext, async (client: Knex.Transaction) => {
        await client(`users`)
          .update({
            lastName: 'Lapointe',
          })
          .where(`id`, userId);

        throw new Error(`Some error`);
      });
    } catch (err) {
      error = err;
    }
    if (!error) {
      assert.fail();
    }

    // ==========================================
    // Not modified! The transaction has been aborted.
    // ==========================================
    const user: ITestUser = await getUserById(userId);
    assert.deepEqual(user.firstName, 'Georges');
    assert.deepEqual(user.lastName, 'Tremblay');
  });

  it(`Retured value, withClient`, async () => {
    const user: ITestUser = await withClient<ITestUser>(
      testContext,
      async (client: Knex.Transaction) => {
        await client(`users`)
          .update({
            lastName: 'aaaaa',
          })
          .where(`id`, userId);

        return await getUserById(userId);
      },
    );

    assert.deepEqual(user.lastName, 'aaaaa');
  });

  it(`Retured value, withTransaction`, async () => {
    const user: ITestUser = await withTransaction<ITestUser>(
      testContext,
      async (client: Knex.Transaction) => {
        await client(`users`)
          .update({
            lastName: 'bbbbb',
          })
          .where(`id`, userId);

        return await getUserById(userId);
      },
    );

    assert.deepEqual(user.lastName, 'bbbbb');
  });
});
