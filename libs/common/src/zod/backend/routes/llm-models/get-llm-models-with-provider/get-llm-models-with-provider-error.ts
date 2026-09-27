import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetLlmModelsWithProviderError = BackendError;

export let zToBackendGetLlmModelsWithProviderError = zBackendError;

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderError,
  z.infer<typeof zToBackendGetLlmModelsWithProviderError>
>({ value: true });
