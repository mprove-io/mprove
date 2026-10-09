import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchAlreadyExistsError,
  zBackendBranchAlreadyExistsError
} from '#common/types/backend/errors/backend-branch-already-exists-error';

export type CheckBranchDoesNotExistResultError =
  BackendBranchAlreadyExistsError;

export let zCheckBranchDoesNotExistResultError =
  zBackendBranchAlreadyExistsError;

assertTypesEqual<
  CheckBranchDoesNotExistResultError,
  z.infer<typeof zCheckBranchDoesNotExistResultError>
>({ value: true });
