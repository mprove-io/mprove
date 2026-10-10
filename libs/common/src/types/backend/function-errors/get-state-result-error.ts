import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartEntToTabResultError,
  zChartEntToTabResultError
} from '#common/types/backend/function-errors/chart-ent-to-tab-result-error';
import {
  type CheckRepoIdResultError,
  zCheckRepoIdResultError
} from '#common/types/backend/function-errors/check-repo-id-result-error';
import {
  type GetBranchCheckExistsResultError,
  zGetBranchCheckExistsResultError
} from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import {
  type GetBridgeCheckExistsResultError,
  zGetBridgeCheckExistsResultError
} from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import {
  type GetDashboardPartsResultError,
  zGetDashboardPartsResultError
} from '#common/types/backend/function-errors/get-dashboard-parts-result-error';
import {
  type GetEnvCheckExistsAndAccessResultError,
  zGetEnvCheckExistsAndAccessResultError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-result-error';
import {
  type GetMemberCheckExistsResultError,
  zGetMemberCheckExistsResultError
} from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import {
  type GetProjectCheckExistsResultError,
  zGetProjectCheckExistsResultError
} from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import {
  type GetStructCheckExistsResultError,
  zGetStructCheckExistsResultError
} from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import {
  type ModelEntToTabResultError,
  zModelEntToTabResultError
} from '#common/types/backend/function-errors/model-ent-to-tab-result-error';
import {
  type ReportEntToTabResultError,
  zReportEntToTabResultError
} from '#common/types/backend/function-errors/report-ent-to-tab-result-error';
import {
  type SendToDiskResultError,
  zSendToDiskResultError
} from '#common/types/backend/function-errors/send-to-disk-result-error';

export type GetStateResultError =
  | CheckRepoIdResultError
  | GetProjectCheckExistsResultError
  | GetMemberCheckExistsResultError
  | GetBranchCheckExistsResultError
  | GetEnvCheckExistsAndAccessResultError
  | GetBridgeCheckExistsResultError
  | SendToDiskResultError
  | GetStructCheckExistsResultError
  | ModelEntToTabResultError
  | ChartEntToTabResultError
  | GetDashboardPartsResultError
  | ReportEntToTabResultError;

export let zGetStateResultError = z.union([
  zCheckRepoIdResultError,
  zGetProjectCheckExistsResultError,
  zGetMemberCheckExistsResultError,
  zGetBranchCheckExistsResultError,
  zGetEnvCheckExistsAndAccessResultError,
  zGetBridgeCheckExistsResultError,
  zSendToDiskResultError,
  zGetStructCheckExistsResultError,
  zModelEntToTabResultError,
  zChartEntToTabResultError,
  zGetDashboardPartsResultError,
  zReportEntToTabResultError
]);

assertTypesEqual<GetStateResultError, z.infer<typeof zGetStateResultError>>({
  value: true
});
