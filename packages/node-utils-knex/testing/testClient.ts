import * as fs from 'fs';
import knex, { Knex } from 'knex';
import { constants } from '../src/config/constants';
import { KnexTransactionManager } from '../src/transactionManager';
import * as path from 'path';

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
  const tempDirPath = path.join(constants.libRoot, 'temp');
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
  }
  const bdFilePath = path.join(tempDirPath, 'testing.better-sqlite3');
  if (fs.existsSync(bdFilePath)) {
    fs.unlinkSync(bdFilePath);
  }

  return knex({
    client: 'better-sqlite3',
    connection: {
      filename: bdFilePath,
    },
    useNullAsDefault: true,
  });
}
