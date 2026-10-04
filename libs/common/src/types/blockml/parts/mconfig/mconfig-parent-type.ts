import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const mconfigParentTypeValues = [
  'Dashboard',
  'ChartDialogDashboard',
  'SuggestDimensionDashboard',
  'Report',
  'ChartDialogReport',
  'SuggestDimensionReport',
  'Chart',
  'SuggestDimensionChart',
  'SuggestDimensionModel',
  'Blank'
] as const;

export type MconfigParentType = (typeof mconfigParentTypeValues)[number];

export let zMconfigParentType = z.enum(mconfigParentTypeValues);

assertTypesEqual<MconfigParentType, z.infer<typeof zMconfigParentType>>({
  value: true
});
