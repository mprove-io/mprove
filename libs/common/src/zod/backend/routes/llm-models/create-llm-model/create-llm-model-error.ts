import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateLlmModelError = BackendError;

export let zToBackendCreateLlmModelError = zBackendError;

assertTypesEqual<
  ToBackendCreateLlmModelError,
  z.infer<typeof zToBackendCreateLlmModelError>
>({ value: true });
