import * as migration_20260509_091136 from './20260509_091136';
import * as migration_20260509_135142 from './20260509_135142';

export const migrations = [
  {
    up: migration_20260509_091136.up,
    down: migration_20260509_091136.down,
    name: '20260509_091136',
  },
  {
    up: migration_20260509_135142.up,
    down: migration_20260509_135142.down,
    name: '20260509_135142'
  },
];
