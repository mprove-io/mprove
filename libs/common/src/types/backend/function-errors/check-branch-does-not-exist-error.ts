import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchAlreadyExistsError,
  zBackendBranchAlreadyExistsError
} from '#common/types/backend/errors/backend-branch-already-exists-error';

export type CheckBranchDoesNotExistError = BackendBranchAlreadyExistsError;

export let zCheckBranchDoesNotExistError = zBackendBranchAlreadyExistsError;

assertTypesEqual<
  CheckBranchDoesNotExistError,
  z.infer<typeof zCheckBranchDoesNotExistError>
>({ value: true });
