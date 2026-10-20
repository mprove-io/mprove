import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';

export type DbChartsFindManyError = ChartEntToTabError;

export let zDbChartsFindManyError = zChartEntToTabError;

assertTypesEqual<DbChartsFindManyError, z.infer<typeof zDbChartsFindManyError>>(
  {
    value: true
  }
);
