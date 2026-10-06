import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const logTypeValues = [
  'input.log',
  'in_views.log',

  'out_entities.log',
  'out_errors.log',
  'out_files.log',
  'out_file2s.log',
  'out_file3s.log',
  'out_filesAny.log',
  'out_stores.log',
  'out_mods.log',
  'out_reports.log',
  'out_dashboards.log',
  'out_charts.log',
  'out_spaces.log',
  'out_schemas.log',
  'out_project_conf.log',
  'out_confs.log',
  'out_metrics.log'
] as const;

export type LogType = (typeof logTypeValues)[number];

export let zLogType = z.enum(logTypeValues);

assertTypesEqual<LogType, z.infer<typeof zLogType>>({
  value: true
});
