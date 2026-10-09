import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/types/backend/errors/backend-branch-does-not-exist-error';
import {
  type BranchEntToTabResultError,
  zBranchEntToTabResultError
} from '#common/types/backend/function-errors/branch-ent-to-tab-result-error';

export type GetBranchCheckExistsResultError =
  | BackendBranchDoesNotExistError
  | BranchEntToTabResultError;

export let zGetBranchCheckExistsResultError = z.union([
  zBackendBranchDoesNotExistError,
  zBranchEntToTabResultError
]);

assertTypesEqual<
  GetBranchCheckExistsResultError,
  z.infer<typeof zGetBranchCheckExistsResultError>
>({ value: true });
