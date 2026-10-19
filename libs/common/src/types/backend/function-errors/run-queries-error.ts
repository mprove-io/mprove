import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CheckParentAccessError,
  zCheckParentAccessError
} from '#common/types/backend/function-errors/check-parent-access-error';
import {
  type CheckRepoIdError,
  zCheckRepoIdError
} from '#common/types/backend/function-errors/check-repo-id-error';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';
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
  type GetQueriesCheckExistSkipSqlDataError,
  zGetQueriesCheckExistSkipSqlDataError
} from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type MconfigEntToTabError,
  zMconfigEntToTabError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';
import {
  type RunQueriesSetupErrorToError,
  zRunQueriesSetupErrorToError
} from '#common/types/backend/function-errors/run-queries-setup-error-to-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type RunQueriesError =
  | RunQueriesSetupErrorToError
  | CheckRepoIdError
  | GetMemberCheckExistsError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | GetBridgeCheckExistsError
  | GetStructCheckExistsError
  | MconfigEntToTabError
  | CheckParentAccessError
  | GetQueriesCheckExistSkipSqlDataError
  | ModelEntToTabError
  | ConnectionEntToTabError
  | WriteError;

export const zRunQueriesError = z.union([
  zRunQueriesSetupErrorToError,
  zCheckRepoIdError,
  zGetMemberCheckExistsError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zGetBridgeCheckExistsError,
  zGetStructCheckExistsError,
  zMconfigEntToTabError,
  zCheckParentAccessError,
  zGetQueriesCheckExistSkipSqlDataError,
  zModelEntToTabError,
  zConnectionEntToTabError,
  zWriteError
]);

assertTypesEqual<RunQueriesError, z.infer<typeof zRunQueriesError>>({
  value: true
});
