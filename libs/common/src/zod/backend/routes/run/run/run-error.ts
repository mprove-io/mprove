import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendRunError = BackendError;

export let zToBackendRunError = zBackendError;

assertTypesEqual<ToBackendRunError, z.infer<typeof zToBackendRunError>>({
  value: true
});
