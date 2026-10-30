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
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type GetUserCheckExistsError,
  zGetUserCheckExistsError
} from '#common/types/backend/function-errors/get-user-check-exists-error';
import {
  type GetUserSelectedGivensError,
  zGetUserSelectedGivensError
} from '#common/types/backend/function-errors/get-user-selected-givens-error';
import {
  type RebuildBlockmlStructError,
  zRebuildBlockmlStructError
} from '#common/types/backend/function-errors/rebuild-blockml-struct-error';

export type RebuildFromYamlError =
  | DbProjectsFindFirstCheckExistsError
  | GetUserCheckExistsError
  | GetUserSelectedGivensError
  | DbMembersFindFirstCheckExistsError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
  | GetStructCheckExistsError
  | GetModelCheckExistsAndAccessError
  | RebuildBlockmlStructError
  | BackendCreateChartFailError;

export const zRebuildFromYamlError = z.union([
  zDbProjectsFindFirstCheckExistsError,
  zGetUserCheckExistsError,
  zGetUserSelectedGivensError,
  zDbMembersFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zDbBridgesFindFirstCheckExistsError,
  zGetStructCheckExistsError,
  zGetModelCheckExistsAndAccessError,
  zRebuildBlockmlStructError,
  zBackendCreateChartFailError
]);

assertTypesEqual<RebuildFromYamlError, z.infer<typeof zRebuildFromYamlError>>({
  value: true
});
