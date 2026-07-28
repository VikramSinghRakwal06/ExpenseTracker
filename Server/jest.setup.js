const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Prefer a system-installed mongod (fast, no network download) when available;
// otherwise mongodb-memory-server transparently downloads its own binary.
if (!process.env.MONGOMS_SYSTEM_BINARY) {
  const systemBinary = ['/usr/bin/mongod', '/usr/local/bin/mongod'].find((p) => fs.existsSync(p));
  if (systemBinary) process.env.MONGOMS_SYSTEM_BINARY = systemBinary;
}

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
