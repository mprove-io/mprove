import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCreateChartFailError,
  zBackendCreateChartFailError
} from '#common/types/backend/errors/backend-create-chart-fail-error';
import {
  type DbBranchesFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/branches/db-branches-find-first-check-exists-error';
import {
  type DbBridgesFindFirstCheckExistsError,
  zDbBridgesFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-check-exists-error';
import {
  type DbMembersFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import {
  type DbProjectsFindFirstCheckExistsError,
  zDbProjectsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import {
  type GetEnvCheckExistsAndAccessError,
  zGetEnvCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import {
  type GetModelCheckExistsAndAccessError,
  zGetModelCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
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
  | DbProjectsFindFirstCheckExistsError
  | GetUserCheckExistsError
  | GetSelectedGivensError
  | DbMembersFindFirstCheckExistsError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
  | GetStructCheckExistsError
  | GetModelCheckExistsAndAccessError
  | RebuildStructError
  | BackendCreateChartFailError;

export const zRebuildFromYamlError = z.union([
  zDbProjectsFindFirstCheckExistsError,
  zGetUserCheckExistsError,
  zGetSelectedGivensError,
  zDbMembersFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zDbBridgesFindFirstCheckExistsError,
  zGetStructCheckExistsError,
  zGetModelCheckExistsAndAccessError,
  zRebuildStructError,
  zBackendCreateChartFailError
]);

assertTypesEqual<RebuildFromYamlError, z.infer<typeof zRebuildFromYamlError>>({
  value: true
});
