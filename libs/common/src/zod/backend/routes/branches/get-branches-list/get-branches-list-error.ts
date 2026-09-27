import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetBranchesListError = BackendError;

export let zToBackendGetBranchesListError = zBackendError;

assertTypesEqual<
  ToBackendGetBranchesListError,
  z.infer<typeof zToBackendGetBranchesListError>
>({ value: true });
