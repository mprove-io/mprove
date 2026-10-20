import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbConnectionsFindFirstCheckExistsError,
  zDbConnectionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/connections/db-connections-find-first-check-exists-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';
import {
  type GetQueryCheckExistsSkipDataError,
  zGetQueryCheckExistsSkipDataError
} from '#common/types/backend/function-errors/get-query-check-exists-skip-data-error';

export type RunQueryDryError =
  | GetQueryCheckExistsSkipDataError
  | GetApiEnvsError
  | DbConnectionsFindFirstCheckExistsError;

export const zRunQueryDryError = z.union([
  zGetQueryCheckExistsSkipDataError,
  zGetApiEnvsError,
  zDbConnectionsFindFirstCheckExistsError
]);

assertTypesEqual<RunQueryDryError, z.infer<typeof zRunQueryDryError>>({
  value: true
});
