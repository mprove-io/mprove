import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';

export type DbChartsFindFirstError = ChartEntToTabError;

export let zDbChartsFindFirstError = zChartEntToTabError;

assertTypesEqual<
  DbChartsFindFirstError,
  z.infer<typeof zDbChartsFindFirstError>
>({
  value: true
});
