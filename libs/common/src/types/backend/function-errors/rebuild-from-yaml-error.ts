import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCreateChartFailError,
  zBackendCreateChartFailError
} from '#common/types/backend/errors/backend-create-chart-fail-error';
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
  type GetModelCheckExistsAndAccessError,
  zGetModelCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import {
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';
import {
  type GetSelectedGivensError,
  zGetSelectedGivensError
} from '#common/types/backend/function-errors/get-selected-givens-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type GetUserCheckExistsError,
  zGetUserCheckExistsError
} from '#common/types/backend/function-errors/get-user-check-exists-error';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';

export type RebuildFromYamlError =
  | GetProjectCheckExistsError
  | GetUserCheckExistsError
  | GetSelectedGivensError
  | GetMemberCheckExistsError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | GetBridgeCheckExistsError
  | GetStructCheckExistsError
  | GetModelCheckExistsAndAccessError
  | RebuildStructError
  | BackendCreateChartFailError;

export const zRebuildFromYamlError = z.union([
  zGetProjectCheckExistsError,
  zGetUserCheckExistsError,
  zGetSelectedGivensError,
  zGetMemberCheckExistsError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zGetBridgeCheckExistsError,
  zGetStructCheckExistsError,
  zGetModelCheckExistsAndAccessError,
  zRebuildStructError,
  zBackendCreateChartFailError
]);

assertTypesEqual<RebuildFromYamlError, z.infer<typeof zRebuildFromYamlError>>({
  value: true
});
