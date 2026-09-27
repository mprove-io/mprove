import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditLlmModelError = BackendError;

export let zToBackendEditLlmModelError = zBackendError;

assertTypesEqual<
  ToBackendEditLlmModelError,
  z.infer<typeof zToBackendEditLlmModelError>
>({ value: true });
