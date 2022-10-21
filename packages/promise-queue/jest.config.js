/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

const baseConfig = require('../../jest.config.base');

const packageName = require('./package.json').name.split('@wireapp/').pop();

module.exports = {
  ...baseConfig,
  roots: [`<rootDir>/packages/${packageName}`],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleDirectories: ['node_modules'],
  modulePaths: [`<rootDir>/packages/${packageName}/src/`],
  displayName: packageName,
  rootDir: '../..',
};
