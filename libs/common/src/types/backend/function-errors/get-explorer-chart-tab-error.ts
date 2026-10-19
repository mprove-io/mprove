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
  type BridgeEntToTabError,
  zBridgeEntToTabError
} from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import {
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';
import {
  type GetMemberCheckExistsError,
  zGetMemberCheckExistsError
} from '#common/types/backend/function-errors/get-member-check-exists-error';
import {
  type GetSessionByIdCheckExistsError,
  zGetSessionByIdCheckExistsError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import {
  type MconfigEntToTabError,
  zMconfigEntToTabError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';
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
  | GetSessionByIdCheckExistsError
  | BackendUnauthorizedError
  | BackendSessionTypeIsNotExplorerError
  | GetMemberCheckExistsError
  | BridgeEntToTabError
  | BackendBridgeBranchEnvDoesNotExistError
  | ChartEntToTabError
  | BackendChartDoesNotExistError
  | MconfigEntToTabError
  | QueryEntToTabError
  | RebuildFromYamlError
  | WriteError
  | RunQueriesError
  | ModelEntToTabError;

export const zGetExplorerChartTabError = z.union([
  zGetSessionByIdCheckExistsError,
  zBackendUnauthorizedError,
  zBackendSessionTypeIsNotExplorerError,
  zGetMemberCheckExistsError,
  zBridgeEntToTabError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zChartEntToTabError,
  zBackendChartDoesNotExistError,
  zMconfigEntToTabError,
  zQueryEntToTabError,
  zRebuildFromYamlError,
  zWriteError,
  zRunQueriesError,
  zModelEntToTabError
]);

assertTypesEqual<
  GetExplorerChartTabError,
  z.infer<typeof zGetExplorerChartTabError>
>({ value: true });
