import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbChartsFindManyError,
  zDbChartsFindManyError
} from '#common/types/backend/function-errors/db/charts/db-charts-find-many-error';
import {
  type DbMconfigsFindManyError,
  zDbMconfigsFindManyError
} from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-many-error';

export type GetChartsCatalogError =
  | DbChartsFindManyError
  | DbMconfigsFindManyError;

export let zGetChartsCatalogError = z.union([
  zDbChartsFindManyError,
  zDbMconfigsFindManyError
]);

assertTypesEqual<GetChartsCatalogError, z.infer<typeof zGetChartsCatalogError>>(
  { value: true }
);
