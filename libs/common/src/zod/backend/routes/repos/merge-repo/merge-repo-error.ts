import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendMergeRepoError = BackendError;

export let zToBackendMergeRepoError = zBackendError;

assertTypesEqual<
  ToBackendMergeRepoError,
  z.infer<typeof zToBackendMergeRepoError>
>({ value: true });
