import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetFileError = BackendError;

export let zToBackendGetFileError = zBackendError;

assertTypesEqual<ToBackendGetFileError, z.infer<typeof zToBackendGetFileError>>(
  { value: true }
);
