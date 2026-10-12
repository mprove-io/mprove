import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';

export type CancelQueryError =
  | GetApiEnvsError
  | BackendConnectionDoesNotExistError;

export const zCancelQueryError = z.union([
  zGetApiEnvsError,
  zBackendConnectionDoesNotExistError
]);

assertTypesEqual<CancelQueryError, z.infer<typeof zCancelQueryError>>({
  value: true
});
