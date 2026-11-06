import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    // Jest 26 predates the `node:` protocol (resolver support arrived in Jest 28) and checks
    // isCoreModule() on the unprefixed name before consulting this map, so mapping straight to
    // '$1' resolves as a file path and fails. Map to shims that re-require the core module.
    // See test/node-shims/README.md.
    '^node:(buffer|crypto|net)$': '<rootDir>/test/node-shims/$1.js',
  },
};
export default config;
