import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendRevertRepoToRemoteError = BackendError;

export let zToBackendRevertRepoToRemoteError = zBackendError;

assertTypesEqual<
  ToBackendRevertRepoToRemoteError,
  z.infer<typeof zToBackendRevertRepoToRemoteError>
>({ value: true });
