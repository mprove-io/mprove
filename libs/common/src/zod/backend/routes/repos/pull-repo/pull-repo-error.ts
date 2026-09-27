import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendPullRepoError = BackendError;

export let zToBackendPullRepoError = zBackendError;

assertTypesEqual<
  ToBackendPullRepoError,
  z.infer<typeof zToBackendPullRepoError>
>({ value: true });
