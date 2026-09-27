import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditConnectionError = BackendError;

export let zToBackendEditConnectionError = zBackendError;

assertTypesEqual<
  ToBackendEditConnectionError,
  z.infer<typeof zToBackendEditConnectionError>
>({ value: true });
