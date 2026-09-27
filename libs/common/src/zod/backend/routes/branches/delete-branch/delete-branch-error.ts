import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteBranchError = BackendError;

export let zToBackendDeleteBranchError = zBackendError;

assertTypesEqual<
  ToBackendDeleteBranchError,
  z.infer<typeof zToBackendDeleteBranchError>
>({ value: true });
