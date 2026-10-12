import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMutuallyExclusiveParamsError,
  zBackendMutuallyExclusiveParamsError
} from '#common/types/backend/errors/backend-mutually-exclusive-params-error';
import {
  type BackendSleepDoesNotWorkWithoutWaitError,
  zBackendSleepDoesNotWorkWithoutWaitError
} from '#common/types/backend/errors/backend-sleep-does-not-work-without-wait-error';
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
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';
import {
  type GetQueriesCheckExistSkipSqlDataError,
  zGetQueriesCheckExistSkipSqlDataError
} from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type PrepareRunChartError,
  zPrepareRunChartError
} from '#common/types/backend/function-errors/prepare-run-chart-error';
import {
  type PrepareRunDashboardError,
  zPrepareRunDashboardError
} from '#common/types/backend/function-errors/prepare-run-dashboard-error';
import {
  type PrepareRunReportError,
  zPrepareRunReportError
} from '#common/types/backend/function-errors/prepare-run-report-error';
import {
  type RunQueriesError,
  zRunQueriesError
} from '#common/types/backend/function-errors/run-queries-error';

export type RunError =
  | BackendMutuallyExclusiveParamsError
  | BackendSleepDoesNotWorkWithoutWaitError
  | CheckRepoIdError
  | GetProjectCheckExistsError
  | GetMemberCheckExistsError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | GetBridgeCheckExistsError
  | GetStructCheckExistsError
  | PrepareRunChartError
  | PrepareRunDashboardError
  | PrepareRunReportError
  | GetQueriesCheckExistSkipSqlDataError
  | RunQueriesError;

export const zRunError = z.union([
  zBackendMutuallyExclusiveParamsError,
  zBackendSleepDoesNotWorkWithoutWaitError,
  zCheckRepoIdError,
  zGetProjectCheckExistsError,
  zGetMemberCheckExistsError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zGetBridgeCheckExistsError,
  zGetStructCheckExistsError,
  zPrepareRunChartError,
  zPrepareRunDashboardError,
  zPrepareRunReportError,
  zGetQueriesCheckExistSkipSqlDataError,
  zRunQueriesError
]);

assertTypesEqual<RunError, z.infer<typeof zRunError>>({ value: true });
