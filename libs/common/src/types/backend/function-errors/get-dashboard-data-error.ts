import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendGetDashboardFailError,
  zBackendGetDashboardFailError
} from '#common/types/backend/errors/backend-get-dashboard-fail-error';
import {
  type GetDashboardXCheckExistsAndAccessError,
  zGetDashboardXCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-dashboard-x-check-exists-and-access-error';
import {
  type GetDashboardXUsingDashboardTabError,
  zGetDashboardXUsingDashboardTabError
} from '#common/types/backend/function-errors/get-dashboard-x-using-dashboard-tab-error';
import {
  type GetModelPartXsError,
  zGetModelPartXsError
} from '#common/types/backend/function-errors/get-model-part-xs-error';
import {
  type GetSelectedGivensError,
  zGetSelectedGivensError
} from '#common/types/backend/function-errors/get-selected-givens-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';
import {
  type ProcessDashboardError,
  zProcessDashboardError
} from '#common/types/backend/function-errors/process-dashboard-error';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type GetDashboardDataError =
  | GetStructCheckExistsError
  | GetDashboardXCheckExistsAndAccessError
  | ModelEntToTabError
  | GetSelectedGivensError
  | RebuildStructError
  | BackendGetDashboardFailError
  | ProcessDashboardError
  | WriteError
  | GetDashboardXUsingDashboardTabError
  | GetModelPartXsError;

export const zGetDashboardDataError = z.union([
  zGetStructCheckExistsError,
  zGetDashboardXCheckExistsAndAccessError,
  zModelEntToTabError,
  zGetSelectedGivensError,
  zRebuildStructError,
  zBackendGetDashboardFailError,
  zProcessDashboardError,
  zWriteError,
  zGetDashboardXUsingDashboardTabError,
  zGetModelPartXsError
]);

assertTypesEqual<GetDashboardDataError, z.infer<typeof zGetDashboardDataError>>(
  { value: true }
);
