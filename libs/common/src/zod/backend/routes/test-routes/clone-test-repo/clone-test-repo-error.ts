import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCloneTestRepoError = BackendError;

export let zToBackendCloneTestRepoError = zBackendError;

assertTypesEqual<
  ToBackendCloneTestRepoError,
  z.infer<typeof zToBackendCloneTestRepoError>
>({ value: true });
