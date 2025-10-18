const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/context/(.*)$': '<rootDir>/context/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
};

module.exports = async () => {
  // Create the base config from next/jest
  const jestConfig = await createJestConfig(customJestConfig)();

  // Forcefully override the transformIgnorePatterns to solve the ESM module issue
  // This is the magic line that should fix the issue
  jestConfig.transformIgnorePatterns = [
    '/node_modules/(?!(mongoose|mongodb|bson|@babel|jest|next|react|@testing-library))/',
    '^.+\.module\.(css|sass|scss)$'
  ];

  return jestConfig;
};