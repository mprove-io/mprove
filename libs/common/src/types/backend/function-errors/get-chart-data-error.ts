import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotExplorerError,
  zBackendMemberIsNotExplorerError
} from '#common/types/backend/errors/backend-member-is-not-explorer-error';
import {
  type CheckChartOrModelAccessError,
  zCheckChartOrModelAccessError
} from '#common/types/backend/function-errors/check-chart-or-model-access-error';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type EditMalloyQueryError,
  zEditMalloyQueryError
} from '#common/types/backend/function-errors/edit-malloy-query-error';
import {
  type GetChartCheckExistsError,
  zGetChartCheckExistsError
} from '#common/types/backend/function-errors/get-chart-check-exists-error';
import {
  type GetMconfigCheckExistsError,
  zGetMconfigCheckExistsError
} from '#common/types/backend/function-errors/get-mconfig-check-exists-error';
import {
  type GetModelCheckExistsError,
  zGetModelCheckExistsError
} from '#common/types/backend/function-errors/get-model-check-exists-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type PrepStoreMconfigQueryError,
  zPrepStoreMconfigQueryError
} from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type GetChartDataError =
  | BackendMemberIsNotExplorerError
  | GetStructCheckExistsError
  | GetChartCheckExistsError
  | GetMconfigCheckExistsError
  | GetModelCheckExistsError
  | CheckChartOrModelAccessError
  | PrepStoreMconfigQueryError
  | EditMalloyQueryError
  | DbErrorToError
  | QueryEntToTabError;

export const zGetChartDataError = z.union([
  zBackendMemberIsNotExplorerError,
  zGetStructCheckExistsError,
  zGetChartCheckExistsError,
  zGetMconfigCheckExistsError,
  zGetModelCheckExistsError,
  zCheckChartOrModelAccessError,
  zPrepStoreMconfigQueryError,
  zEditMalloyQueryError,
  zDbErrorToError,
  zQueryEntToTabError
]);

assertTypesEqual<GetChartDataError, z.infer<typeof zGetChartDataError>>({
  value: true
});
