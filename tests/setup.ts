import mongoose from 'mongoose';
import { config } from '../src/config';

// Set test environment
process.env.NODE_ENV = 'test';

// Connect to test database
beforeAll(async () => {
  try {
    await mongoose.connect(config.database.uri);
  } catch (error) {
    console.error('Test database connection failed:', error);
    process.exit(1);
  }
});

// Clear database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect from database after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 