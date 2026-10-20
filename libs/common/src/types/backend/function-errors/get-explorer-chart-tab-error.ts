import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBridgeBranchEnvDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError
} from '#common/types/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import {
  type BackendChartDoesNotExistError,
  zBackendChartDoesNotExistError
} from '#common/types/backend/errors/backend-chart-does-not-exist-error';
import {
  type BackendSessionTypeIsNotExplorerError,
  zBackendSessionTypeIsNotExplorerError
} from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
import {
  type BackendUnauthorizedError,
  zBackendUnauthorizedError
} from '#common/types/backend/errors/backend-unauthorized-error';
import {
  type DbBridgesFindFirstError,
  zDbBridgesFindFirstError
} from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-error';
import {
  type DbChartsFindFirstError,
  zDbChartsFindFirstError
} from '#common/types/backend/function-errors/db/charts/db-charts-find-first-error';
import {
  type DbMconfigsFindFirstError,
  zDbMconfigsFindFirstError
} from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-first-error';
import {
  type DbMembersFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import {
  type DbModelsFindManyError,
  zDbModelsFindManyError
} from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import {
  type DbQueriesFindFirstError,
  zDbQueriesFindFirstError
} from '#common/types/backend/function-errors/db/queries/db-queries-find-first-error';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import {
  type RebuildFromYamlError,
  zRebuildFromYamlError
} from '#common/types/backend/function-errors/rebuild-from-yaml-error';
import {
  type RunQueriesError,
  zRunQueriesError
} from '#common/types/backend/function-errors/run-queries-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type GetExplorerChartTabError =
  | DbSessionsFindFirstCheckExistsError
  | BackendUnauthorizedError
  | BackendSessionTypeIsNotExplorerError
  | DbMembersFindFirstCheckExistsError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendChartDoesNotExistError
  | RebuildFromYamlError
  | WriteError
  | RunQueriesError
  | DbBridgesFindFirstError
  | DbChartsFindFirstError
  | DbMconfigsFindFirstError
  | DbQueriesFindFirstError
  | DbModelsFindManyError;

export const zGetExplorerChartTabError = z.union([
  zDbSessionsFindFirstCheckExistsError,
  zBackendUnauthorizedError,
  zBackendSessionTypeIsNotExplorerError,
  zDbMembersFindFirstCheckExistsError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendChartDoesNotExistError,
  zRebuildFromYamlError,
  zWriteError,
  zRunQueriesError,
  zDbBridgesFindFirstError,
  zDbChartsFindFirstError,
  zDbMconfigsFindFirstError,
  zDbQueriesFindFirstError,
  zDbModelsFindManyError
]);

assertTypesEqual<
  GetExplorerChartTabError,
  z.infer<typeof zGetExplorerChartTabError>
>({ value: true });
