import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';

export type GetChartsCatalogError = ChartEntToTabError;

export let zGetChartsCatalogError = zChartEntToTabError;

assertTypesEqual<GetChartsCatalogError, z.infer<typeof zGetChartsCatalogError>>(
  { value: true }
);
