import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateBranchError = BackendError;

export let zToBackendCreateBranchError = zBackendError;

assertTypesEqual<
  ToBackendCreateBranchError,
  z.infer<typeof zToBackendCreateBranchError>
>({ value: true });
