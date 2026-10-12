import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartEntToTabError,
  zChartEntToTabError
} from '#common/types/backend/function-errors/chart-ent-to-tab-error';
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
  type GetDashboardPartsError,
  zGetDashboardPartsError
} from '#common/types/backend/function-errors/get-dashboard-parts-error';
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
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';
import {
  type ReportEntToTabError,
  zReportEntToTabError
} from '#common/types/backend/function-errors/report-ent-to-tab-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';

export type GetStateError =
  | CheckRepoIdError
  | GetProjectCheckExistsError
  | GetMemberCheckExistsError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | GetBridgeCheckExistsError
  | SendToDiskError
  | GetStructCheckExistsError
  | ModelEntToTabError
  | ChartEntToTabError
  | GetDashboardPartsError
  | ReportEntToTabError;

export let zGetStateError = z.union([
  zCheckRepoIdError,
  zGetProjectCheckExistsError,
  zGetMemberCheckExistsError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zGetBridgeCheckExistsError,
  zSendToDiskError,
  zGetStructCheckExistsError,
  zModelEntToTabError,
  zChartEntToTabError,
  zGetDashboardPartsError,
  zReportEntToTabError
]);

assertTypesEqual<GetStateError, z.infer<typeof zGetStateError>>({
  value: true
});
