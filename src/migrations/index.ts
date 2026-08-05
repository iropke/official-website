import * as migration_20260509_091136 from './20260509_091136';
import * as migration_20260509_135142 from './20260509_135142';
import * as migration_20260509_142115 from './20260509_142115';
import * as migration_20260510_120000 from './20260510_120000';
import * as migration_20260511_105811 from './20260511_105811';
import * as migration_20260511_133928 from './20260511_133928';
import * as migration_20260516_072502 from './20260516_072502';
import * as migration_20260517_052627_remove_site_settings_dead_fields from './20260517_052627_remove_site_settings_dead_fields';
import * as migration_20260522_220734 from './20260522_220734';
import * as migration_20260621_153257 from './20260621_153257';
import * as migration_20260805_092106_inquiries_budget from './20260805_092106_inquiries_budget';

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
    name: '20260509_142115',
  },
  {
    up: migration_20260510_120000.up,
    down: migration_20260510_120000.down,
    name: '20260510_120000',
  },
  {
    up: migration_20260511_105811.up,
    down: migration_20260511_105811.down,
    name: '20260511_105811',
  },
  {
    up: migration_20260511_133928.up,
    down: migration_20260511_133928.down,
    name: '20260511_133928',
  },
  {
    up: migration_20260516_072502.up,
    down: migration_20260516_072502.down,
    name: '20260516_072502',
  },
  {
    up: migration_20260517_052627_remove_site_settings_dead_fields.up,
    down: migration_20260517_052627_remove_site_settings_dead_fields.down,
    name: '20260517_052627_remove_site_settings_dead_fields',
  },
  {
    up: migration_20260522_220734.up,
    down: migration_20260522_220734.down,
    name: '20260522_220734',
  },
  {
    up: migration_20260621_153257.up,
    down: migration_20260621_153257.down,
    name: '20260621_153257',
  },
  {
    up: migration_20260805_092106_inquiries_budget.up,
    down: migration_20260805_092106_inquiries_budget.down,
    name: '20260805_092106_inquiries_budget'
  },
];
