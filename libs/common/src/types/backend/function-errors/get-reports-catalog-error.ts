import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbReportsFindManyError,
  zDbReportsFindManyError
} from '#common/types/backend/function-errors/db/reports/db-reports-find-many-error';

export type GetReportsCatalogError = DbReportsFindManyError;

export let zGetReportsCatalogError = zDbReportsFindManyError;

assertTypesEqual<
  GetReportsCatalogError,
  z.infer<typeof zGetReportsCatalogError>
>({ value: true });
