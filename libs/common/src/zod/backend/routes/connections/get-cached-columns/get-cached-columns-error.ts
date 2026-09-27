import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetCachedColumnsError = BackendError;

export let zToBackendGetCachedColumnsError = zBackendError;

assertTypesEqual<
  ToBackendGetCachedColumnsError,
  z.infer<typeof zToBackendGetCachedColumnsError>
>({ value: true });
