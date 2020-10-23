module.exports = {
  all: true,
  'check-coverage': true,
  exclude: ['**/*.d.ts', '**/*.test*.ts', '**/index.ts', '**/src/test/**/*'],
  extension: ['.ts'],
  include: ['src/**/*.ts'],
  lines: 0,
  'per-file': false,
  reporter: ['text-summary'],
  reporter: ['html'],
  require: ['ts-node/register'],
};
