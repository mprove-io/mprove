import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartEntToTabResultError,
  zChartEntToTabResultError
} from '#common/types/backend/function-errors/chart-ent-to-tab-result-error';

export type GetChartsCatalogResultError = ChartEntToTabResultError;

export let zGetChartsCatalogResultError = zChartEntToTabResultError;

assertTypesEqual<
  GetChartsCatalogResultError,
  z.infer<typeof zGetChartsCatalogResultError>
>({ value: true });
