import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CheckRepoIdError,
  zCheckRepoIdError
} from '#common/types/backend/function-errors/check-repo-id-error';
import {
  type GetBranchCheckExistsError,
  zGetBranchCheckExistsError
} from '#common/types/backend/function-errors/get-branch-check-exists-error';
import {
  type GetBridgeCheckExistsError,
  zGetBridgeCheckExistsError
} from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import {
  type GetEnvCheckExistsAndAccessError,
  zGetEnvCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import {
  type GetMemberCheckExistsError,
  zGetMemberCheckExistsError
} from '#common/types/backend/function-errors/get-member-check-exists-error';
import {
  type GetModelCheckExistsError,
  zGetModelCheckExistsError
} from '#common/types/backend/function-errors/get-model-check-exists-error';
import {
  type GetModelPartXsError,
  zGetModelPartXsError
} from '#common/types/backend/function-errors/get-model-part-xs-error';
import {
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';

export type GetModelError =
  | CheckRepoIdError
  | GetProjectCheckExistsError
  | GetMemberCheckExistsError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | GetBridgeCheckExistsError
  | GetModelCheckExistsError
  | GetStructCheckExistsError
  | GetModelPartXsError;

export let zGetModelError = z.union([
  zCheckRepoIdError,
  zGetProjectCheckExistsError,
  zGetMemberCheckExistsError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zGetBridgeCheckExistsError,
  zGetModelCheckExistsError,
  zGetStructCheckExistsError,
  zGetModelPartXsError
]);

assertTypesEqual<GetModelError, z.infer<typeof zGetModelError>>({
  value: true
});
