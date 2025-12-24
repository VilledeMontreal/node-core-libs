import { Knex } from 'knex';
import { KnexTransactionManager } from '../src/transactionManager';
import { ITestContext } from '../src/transactionManager.test';
import { getTestKnexClient } from './testClient';

export class TestRepo {
  private txManager = new KnexTransactionManager(getTestKnexClient);

  public async changeFirstName(
    context: ITestContext,
    userId: number,
    newFirstName: string,
  ): Promise<void> {
    await this.txManager.withClient(context, async (client: Knex.Transaction) => {
      await client(`users`)
        .update({
          firstName: newFirstName,
        })
        .where(`id`, userId);
    });
  }
  public async generateSqlError(context: ITestContext): Promise<void> {
    await this.txManager.withClient(context, async (client: Knex.Transaction) => {
      await client(`NOPE`) // table doesn't exist
        .update({
          firstName: 'titi',
        })
        .where(`id`, 123);
    });
  }
}
export const testRepo: TestRepo = new TestRepo();
