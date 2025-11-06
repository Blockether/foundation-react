/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/components/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/src/components/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/testSetup.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.spec.{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
};