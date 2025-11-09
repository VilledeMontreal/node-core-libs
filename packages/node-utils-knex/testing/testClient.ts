import * as fs from 'fs';
import knex, { Knex } from 'knex';
import { constants } from '../src/config/constants';
import { KnexTransactionManager } from '../src/transactionManager';

let knexClient: Knex;
let txManager: KnexTransactionManager;

/**
 * Get/create the test Knex client
 */
export async function getTestKnexClient() {
  if (!knexClient) {
    knexClient = await createKnexClient();
  }
  return knexClient;
}

/**
 * Get/create the test Knex transaction manager
 */
export async function getTestTransactionManager() {
  if (!txManager) {
    txManager = new KnexTransactionManager(getTestKnexClient);
  }
  return txManager;
}

/**
 * Destroy the test Knex client
 */
export async function destroyTestKnexClient() {
  if (knexClient) {
    await knexClient.destroy();
  }
}

async function createKnexClient() {
  const tempDirPath = `${constants.libRoot}/temp`;
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
  }
  const bdFilePath = `${tempDirPath}/testing.sqlite`;
  if (fs.existsSync(bdFilePath)) {
    fs.unlinkSync(bdFilePath);
  }

  return knex({
    client: 'sqlite',
    connection: {
      filename: bdFilePath,
    },
    useNullAsDefault: true,
  });
}
