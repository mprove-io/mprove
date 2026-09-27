import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendPushRepoError = BackendError;

export let zToBackendPushRepoError = zBackendError;

assertTypesEqual<
  ToBackendPushRepoError,
  z.infer<typeof zToBackendPushRepoError>
>({ value: true });
