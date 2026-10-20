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
  | DbProjectsFindFirstCheckExistsError
  | DbMembersFindFirstCheckExistsError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
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
  zDbProjectsFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zDbBridgesFindFirstCheckExistsError,
  zGetStructCheckExistsError,
  zPrepareRunChartError,
  zPrepareRunDashboardError,
  zPrepareRunReportError,
  zGetQueriesCheckExistSkipSqlDataError,
  zRunQueriesError
]);

assertTypesEqual<RunError, z.infer<typeof zRunError>>({ value: true });
