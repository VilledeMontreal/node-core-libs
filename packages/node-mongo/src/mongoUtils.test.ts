import { assert } from 'chai';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server-core';
import { constants as mongodbConstants } from './config/constants';
import { IMongooseConfigs } from './config/mongooseConfigs';
import { mongoUtils } from './mongoUtils';

const testconfig: IMongooseConfigs = mongodbConstants.testsConfig;

describe('MongoUtils - #mockMongoose', () => {
  afterEach(async function () {
    await mongoUtils.dropMockedDatabases();
  });

  /*
    It is mandatory to create a new instance of MongoUtils to test the function mockMongoose as the singleton will keep its parameters instanced if used again. The parameter mongoMemServer, if instanciated by a first call,
    won't be changed on a second one, as if the memory server is already mocked, nothing happens.
  */
  it('should return a mongo memory server', async function () {
    const memServ = await mongoUtils.mockMongoose(this, testconfig.mockServer.serverVersion, false);
    assert.isDefined(memServ);
    assert.instanceOf(memServ, MongoMemoryServer);
  });

  it('should return a mongo memory replica set', async function () {
    const memServ = await mongoUtils.mockMongoose(this, testconfig.mockServer.serverVersion, true);
    assert.isDefined(memServ);
    assert.instanceOf(memServ, MongoMemoryReplSet);
  });
});
