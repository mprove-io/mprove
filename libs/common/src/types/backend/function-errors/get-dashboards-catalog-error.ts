import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbDashboardsFindManyError,
  zDbDashboardsFindManyError
} from '#common/types/backend/function-errors/db/dashboards/db-dashboards-find-many-error';

export type GetDashboardsCatalogError = DbDashboardsFindManyError;

export let zGetDashboardsCatalogError = zDbDashboardsFindManyError;

assertTypesEqual<
  GetDashboardsCatalogError,
  z.infer<typeof zGetDashboardsCatalogError>
>({ value: true });
