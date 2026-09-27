import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetModelError = BackendError;

export let zToBackendGetModelError = zBackendError;

assertTypesEqual<
  ToBackendGetModelError,
  z.infer<typeof zToBackendGetModelError>
>({ value: true });
