import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendTestConnectionError = BackendError;

export let zToBackendTestConnectionError = zBackendError;

assertTypesEqual<
  ToBackendTestConnectionError,
  z.infer<typeof zToBackendTestConnectionError>
>({ value: true });
