import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';
import {
  type GetConnectionCheckExistsError,
  zGetConnectionCheckExistsError
} from '#common/types/backend/function-errors/get-connection-check-exists-error';
import {
  type GetQueryCheckExistsSkipDataError,
  zGetQueryCheckExistsSkipDataError
} from '#common/types/backend/function-errors/get-query-check-exists-skip-data-error';

export type RunQueryDryError =
  | GetQueryCheckExistsSkipDataError
  | GetApiEnvsError
  | GetConnectionCheckExistsError;

export const zRunQueryDryError = z.union([
  zGetQueryCheckExistsSkipDataError,
  zGetApiEnvsError,
  zGetConnectionCheckExistsError
]);

assertTypesEqual<RunQueryDryError, z.infer<typeof zRunQueryDryError>>({
  value: true
});
