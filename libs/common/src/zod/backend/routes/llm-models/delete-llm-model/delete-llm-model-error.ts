import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteLlmModelError = BackendError;

export let zToBackendDeleteLlmModelError = zBackendError;

assertTypesEqual<
  ToBackendDeleteLlmModelError,
  z.infer<typeof zToBackendDeleteLlmModelError>
>({ value: true });
