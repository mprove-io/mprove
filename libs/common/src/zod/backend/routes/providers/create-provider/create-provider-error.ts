import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateProviderError = BackendError;

export let zToBackendCreateProviderError = zBackendError;

assertTypesEqual<
  ToBackendCreateProviderError,
  z.infer<typeof zToBackendCreateProviderError>
>({ value: true });
