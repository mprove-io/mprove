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
  type GetBranchCheckExistsError,
  zGetBranchCheckExistsError
} from '#common/types/backend/function-errors/get-branch-check-exists-error';
import {
  type GetBridgeCheckExistsError,
  zGetBridgeCheckExistsError
} from '#common/types/backend/function-errors/get-bridge-check-exists-error';
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
  type GetMemberCheckExistsError,
  zGetMemberCheckExistsError
} from '#common/types/backend/function-errors/get-member-check-exists-error';
import {
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';
import {
  type QueryInfoReportGetReportDataError,
  zQueryInfoReportGetReportDataError
} from '#common/types/backend/function-errors/query-info-report-get-report-data-error';

export type GetQueryInfoError =
  | BackendMutuallyExclusiveParamsError
  | BackendDashboardIdChartIdAndReportIdAreNotDefinedError
  | BackendTileIndexDoesNotWorkWithoutDashboardIdError
  | BackendRowIdDoesNotWorkWithoutReportIdError
  | CheckRepoIdError
  | GetProjectCheckExistsError
  | GetMemberCheckExistsError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | GetBridgeCheckExistsError
  | GetChartDataError
  | GetDashboardDataError
  | QueryInfoReportGetReportDataError;

export const zGetQueryInfoError = z.union([
  zBackendMutuallyExclusiveParamsError,
  zBackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  zBackendTileIndexDoesNotWorkWithoutDashboardIdError,
  zBackendRowIdDoesNotWorkWithoutReportIdError,
  zCheckRepoIdError,
  zGetProjectCheckExistsError,
  zGetMemberCheckExistsError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zGetBridgeCheckExistsError,
  zGetChartDataError,
  zGetDashboardDataError,
  zQueryInfoReportGetReportDataError
]);

assertTypesEqual<GetQueryInfoError, z.infer<typeof zGetQueryInfoError>>({
  value: true
});
