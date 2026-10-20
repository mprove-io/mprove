import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CheckRepoIdError,
  zCheckRepoIdError
} from '#common/types/backend/function-errors/check-repo-id-error';
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
  type DbModelsFindFirstCheckExistsError,
  zDbModelsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/models/db-models-find-first-check-exists-error';
import {
  type DbProjectsFindFirstCheckExistsError,
  zDbProjectsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import {
  type GetEnvCheckExistsAndAccessError,
  zGetEnvCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import {
  type GetModelPartXsError,
  zGetModelPartXsError
} from '#common/types/backend/function-errors/get-model-part-xs-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';

export type GetModelError =
  | CheckRepoIdError
  | DbProjectsFindFirstCheckExistsError
  | DbMembersFindFirstCheckExistsError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
  | DbModelsFindFirstCheckExistsError
  | GetStructCheckExistsError
  | GetModelPartXsError;

export let zGetModelError = z.union([
  zCheckRepoIdError,
  zDbProjectsFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zDbBridgesFindFirstCheckExistsError,
  zDbModelsFindFirstCheckExistsError,
  zGetStructCheckExistsError,
  zGetModelPartXsError
]);

assertTypesEqual<GetModelError, z.infer<typeof zGetModelError>>({
  value: true
});
