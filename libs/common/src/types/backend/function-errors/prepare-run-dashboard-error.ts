import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDashboardNotFoundError,
  zBackendDashboardNotFoundError
} from '#common/types/backend/errors/backend-dashboard-not-found-error';
import {
  type GetDashboardPartsError,
  zGetDashboardPartsError
} from '#common/types/backend/function-errors/get-dashboard-parts-error';

export type PrepareRunDashboardError =
  | GetDashboardPartsError
  | BackendDashboardNotFoundError;

export const zPrepareRunDashboardError = z.union([
  zGetDashboardPartsError,
  zBackendDashboardNotFoundError
]);

assertTypesEqual<
  PrepareRunDashboardError,
  z.infer<typeof zPrepareRunDashboardError>
>({ value: true });
