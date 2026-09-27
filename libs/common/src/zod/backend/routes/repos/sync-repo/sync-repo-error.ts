import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSyncRepoError = BackendError;

export let zToBackendSyncRepoError = zBackendError;

assertTypesEqual<
  ToBackendSyncRepoError,
  z.infer<typeof zToBackendSyncRepoError>
>({ value: true });
