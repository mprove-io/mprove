import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditProviderError = BackendError;

export let zToBackendEditProviderError = zBackendError;

assertTypesEqual<
  ToBackendEditProviderError,
  z.infer<typeof zToBackendEditProviderError>
>({ value: true });
