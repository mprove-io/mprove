import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCommitRepoError = BackendError;

export let zToBackendCommitRepoError = zBackendError;

assertTypesEqual<
  ToBackendCommitRepoError,
  z.infer<typeof zToBackendCommitRepoError>
>({ value: true });
