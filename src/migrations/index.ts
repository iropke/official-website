import * as migration_20260509_091136 from './20260509_091136';
import * as migration_20260509_135142 from './20260509_135142';
import * as migration_20260509_142115 from './20260509_142115';

export const migrations = [
  {
    up: migration_20260509_091136.up,
    down: migration_20260509_091136.down,
    name: '20260509_091136',
  },
  {
    up: migration_20260509_135142.up,
    down: migration_20260509_135142.down,
    name: '20260509_135142',
  },
  {
    up: migration_20260509_142115.up,
    down: migration_20260509_142115.down,
    name: '20260509_142115'
  },
];
