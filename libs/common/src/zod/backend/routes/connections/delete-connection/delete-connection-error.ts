import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteConnectionError = BackendError;

export let zToBackendDeleteConnectionError = zBackendError;

assertTypesEqual<
  ToBackendDeleteConnectionError,
  z.infer<typeof zToBackendDeleteConnectionError>
>({ value: true });
