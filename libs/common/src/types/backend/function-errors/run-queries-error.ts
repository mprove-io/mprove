import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CheckParentMemberAccessError,
  zCheckParentMemberAccessError
} from '#common/types/backend/function-errors/check-parent-member-access-error';
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
  type DbConnectionsFindManyError,
  zDbConnectionsFindManyError
} from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import {
  type DbMconfigsFindManyError,
  zDbMconfigsFindManyError
} from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-many-error';
import {
  type DbMembersFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import {
  type DbModelsFindManyError,
  zDbModelsFindManyError
} from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import {
  type GetEnvCheckExistsAndAccessError,
  zGetEnvCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import {
  type GetQueriesCheckExistSkipSqlDataError,
  zGetQueriesCheckExistSkipSqlDataError
} from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type LaunchPooledQueryError,
  zLaunchPooledQueryError
} from '#common/types/backend/function-errors/launch-pooled-query-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type RunQueriesError =
  | LaunchPooledQueryError
  | CheckRepoIdError
  | DbMembersFindFirstCheckExistsError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
  | GetStructCheckExistsError
  | CheckParentMemberAccessError
  | GetQueriesCheckExistSkipSqlDataError
  | WriteError
  | DbMconfigsFindManyError
  | DbModelsFindManyError
  | DbConnectionsFindManyError;

export const zRunQueriesError = z.union([
  zLaunchPooledQueryError,
  zCheckRepoIdError,
  zDbMembersFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zDbBridgesFindFirstCheckExistsError,
  zGetStructCheckExistsError,
  zCheckParentMemberAccessError,
  zGetQueriesCheckExistSkipSqlDataError,
  zWriteError,
  zDbMconfigsFindManyError,
  zDbModelsFindManyError,
  zDbConnectionsFindManyError
]);

assertTypesEqual<RunQueriesError, z.infer<typeof zRunQueriesError>>({
  value: true
});
