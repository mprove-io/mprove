import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const callerValues = [
  'AppModule',
  'RebuildStruct',

  'Extra',

  'BuildChart',
  'BuildDashboard',

  'BuildStoreField',
  'BuildDashboardField',
  'BuildReportField',

  'BuildDashboardTileCharts',
  'BuildChartTileCharts',
  'BuildReportCharts',

  'BuildModelMetric',

  'BuildModStart',

  'BuildReport',

  'BuildStoreNext',
  'BuildStoreStart',
  'BuildSpace',

  'BuildDashboardTile',
  'BuildChartTile',
  'BuildYaml',

  'BuildCheckVmdSuggestModelDimension'
] as const;

export type Caller = (typeof callerValues)[number];

export let zCaller = z.enum(callerValues);

assertTypesEqual<Caller, z.infer<typeof zCaller>>({
  value: true
});
