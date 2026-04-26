import * as migration_20260426_150140 from './20260426_150140';

export const migrations = [
  {
    up: migration_20260426_150140.up,
    down: migration_20260426_150140.down,
    name: '20260426_150140'
  },
];
