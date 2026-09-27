import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditEnvFallbacksError = BackendError;

export let zToBackendEditEnvFallbacksError = zBackendError;

assertTypesEqual<
  ToBackendEditEnvFallbacksError,
  z.infer<typeof zToBackendEditEnvFallbacksError>
>({ value: true });
