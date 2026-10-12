import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type PrepStoreMconfigQueryError,
  zPrepStoreMconfigQueryError
} from '#common/types/backend/function-errors/prep-store-mconfig-query-error';

export type ProcessDashboardError = PrepStoreMconfigQueryError;

export const zProcessDashboardError = zPrepStoreMconfigQueryError;

assertTypesEqual<ProcessDashboardError, z.infer<typeof zProcessDashboardError>>(
  { value: true }
);
