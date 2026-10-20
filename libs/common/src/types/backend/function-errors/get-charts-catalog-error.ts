import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbChartsFindManyError,
  zDbChartsFindManyError
} from '#common/types/backend/function-errors/db/charts/db-charts-find-many-error';

export type GetChartsCatalogError = DbChartsFindManyError;

export let zGetChartsCatalogError = zDbChartsFindManyError;

assertTypesEqual<GetChartsCatalogError, z.infer<typeof zGetChartsCatalogError>>(
  { value: true }
);
