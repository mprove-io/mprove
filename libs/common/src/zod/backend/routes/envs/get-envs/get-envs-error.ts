import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetEnvsError = BackendError;

export let zToBackendGetEnvsError = zBackendError;

assertTypesEqual<ToBackendGetEnvsError, z.infer<typeof zToBackendGetEnvsError>>(
  { value: true }
);
