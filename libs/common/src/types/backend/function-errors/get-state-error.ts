import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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
  type DbChartsFindManyError,
  zDbChartsFindManyError
} from '#common/types/backend/function-errors/db/charts/db-charts-find-many-error';
import {
  type DbMembersFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import {
  type DbModelsFindManyError,
  zDbModelsFindManyError
} from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import {
  type DbProjectsFindFirstCheckExistsError,
  zDbProjectsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import {
  type DbReportsFindManyError,
  zDbReportsFindManyError
} from '#common/types/backend/function-errors/db/reports/db-reports-find-many-error';
import {
  type GetDashboardPartsError,
  zGetDashboardPartsError
} from '#common/types/backend/function-errors/get-dashboard-parts-error';
import {
  type GetEnvCheckExistsAndAccessError,
  zGetEnvCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';

export type GetStateError =
  | CheckRepoIdError
  | DbProjectsFindFirstCheckExistsError
  | DbMembersFindFirstCheckExistsError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
  | SendToDiskError
  | GetStructCheckExistsError
  | GetDashboardPartsError
  | DbModelsFindManyError
  | DbChartsFindManyError
  | DbReportsFindManyError;

export let zGetStateError = z.union([
  zCheckRepoIdError,
  zDbProjectsFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zDbBridgesFindFirstCheckExistsError,
  zSendToDiskError,
  zGetStructCheckExistsError,
  zGetDashboardPartsError,
  zDbModelsFindManyError,
  zDbChartsFindManyError,
  zDbReportsFindManyError
]);

assertTypesEqual<GetStateError, z.infer<typeof zGetStateError>>({
  value: true
});
