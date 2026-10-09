import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CheckRepoIdResultError,
  zCheckRepoIdResultError
} from '#common/types/backend/function-errors/check-repo-id-result-error';
import {
  type GetBranchCheckExistsResultError,
  zGetBranchCheckExistsResultError
} from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import {
  type GetBridgeCheckExistsResultError,
  zGetBridgeCheckExistsResultError
} from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import {
  type GetEnvCheckExistsAndAccessResultError,
  zGetEnvCheckExistsAndAccessResultError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-result-error';
import {
  type GetMemberCheckExistsResultError,
  zGetMemberCheckExistsResultError
} from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import {
  type GetModelCheckExistsResultError,
  zGetModelCheckExistsResultError
} from '#common/types/backend/function-errors/get-model-check-exists-result-error';
import {
  type GetModelPartXsResultError,
  zGetModelPartXsResultError
} from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import {
  type GetProjectCheckExistsResultError,
  zGetProjectCheckExistsResultError
} from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import {
  type GetStructCheckExistsResultError,
  zGetStructCheckExistsResultError
} from '#common/types/backend/function-errors/get-struct-check-exists-result-error';

export type GetModelResultError =
  | CheckRepoIdResultError
  | GetProjectCheckExistsResultError
  | GetMemberCheckExistsResultError
  | GetBranchCheckExistsResultError
  | GetEnvCheckExistsAndAccessResultError
  | GetBridgeCheckExistsResultError
  | GetModelCheckExistsResultError
  | GetStructCheckExistsResultError
  | GetModelPartXsResultError;

export let zGetModelResultError = z.union([
  zCheckRepoIdResultError,
  zGetProjectCheckExistsResultError,
  zGetMemberCheckExistsResultError,
  zGetBranchCheckExistsResultError,
  zGetEnvCheckExistsAndAccessResultError,
  zGetBridgeCheckExistsResultError,
  zGetModelCheckExistsResultError,
  zGetStructCheckExistsResultError,
  zGetModelPartXsResultError
]);

assertTypesEqual<GetModelResultError, z.infer<typeof zGetModelResultError>>({
  value: true
});
