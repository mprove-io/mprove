import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  zBackendDashboardIdChartIdAndReportIdAreNotDefinedError
} from '#common/types/backend/errors/backend-dashboard-id-chart-id-and-report-id-are-not-defined-error';
import {
  type BackendMutuallyExclusiveParamsError,
  zBackendMutuallyExclusiveParamsError
} from '#common/types/backend/errors/backend-mutually-exclusive-params-error';
import {
  type BackendRowIdDoesNotWorkWithoutReportIdError,
  zBackendRowIdDoesNotWorkWithoutReportIdError
} from '#common/types/backend/errors/backend-row-id-does-not-work-without-report-id-error';
import {
  type BackendTileIndexDoesNotWorkWithoutDashboardIdError,
  zBackendTileIndexDoesNotWorkWithoutDashboardIdError
} from '#common/types/backend/errors/backend-tile-index-does-not-work-without-dashboard-id-error';
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
  type GetChartDataError,
  zGetChartDataError
} from '#common/types/backend/function-errors/get-chart-data-error';
import {
  type GetDashboardDataError,
  zGetDashboardDataError
} from '#common/types/backend/function-errors/get-dashboard-data-error';
import {
  type GetEnvCheckExistsAndAccessError,
  zGetEnvCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import {
  type GetQueryInfoReportDataError,
  zGetQueryInfoReportDataError
} from '#common/types/backend/function-errors/get-query-info-report-data-error';

export type GetQueryInfoError =
  | BackendMutuallyExclusiveParamsError
  | BackendDashboardIdChartIdAndReportIdAreNotDefinedError
  | BackendTileIndexDoesNotWorkWithoutDashboardIdError
  | BackendRowIdDoesNotWorkWithoutReportIdError
  | CheckRepoIdError
  | DbProjectsFindFirstCheckExistsError
  | DbMembersFindFirstCheckExistsError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
  | GetChartDataError
  | GetDashboardDataError
  | GetQueryInfoReportDataError;

export const zGetQueryInfoError = z.union([
  zBackendMutuallyExclusiveParamsError,
  zBackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  zBackendTileIndexDoesNotWorkWithoutDashboardIdError,
  zBackendRowIdDoesNotWorkWithoutReportIdError,
  zCheckRepoIdError,
  zDbProjectsFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zDbBridgesFindFirstCheckExistsError,
  zGetChartDataError,
  zGetDashboardDataError,
  zGetQueryInfoReportDataError
]);

assertTypesEqual<GetQueryInfoError, z.infer<typeof zGetQueryInfoError>>({
  value: true
});
