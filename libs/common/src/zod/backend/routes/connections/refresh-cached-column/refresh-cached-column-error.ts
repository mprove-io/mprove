import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendRefreshCachedColumnError = BackendError;

export let zToBackendRefreshCachedColumnError = zBackendError;

assertTypesEqual<
  ToBackendRefreshCachedColumnError,
  z.infer<typeof zToBackendRefreshCachedColumnError>
>({ value: true });
