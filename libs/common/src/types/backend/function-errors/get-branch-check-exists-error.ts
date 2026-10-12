import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/types/backend/errors/backend-branch-does-not-exist-error';
import {
  type BranchEntToTabError,
  zBranchEntToTabError
} from '#common/types/backend/function-errors/branch-ent-to-tab-error';

export type GetBranchCheckExistsError =
  | BackendBranchDoesNotExistError
  | BranchEntToTabError;

export let zGetBranchCheckExistsError = z.union([
  zBackendBranchDoesNotExistError,
  zBranchEntToTabError
]);

assertTypesEqual<
  GetBranchCheckExistsError,
  z.infer<typeof zGetBranchCheckExistsError>
>({ value: true });
