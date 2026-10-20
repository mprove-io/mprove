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
  type DbMconfigsFindFirstCheckExistsError,
  zDbMconfigsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-first-check-exists-error';
import {
  type DbModelsFindFirstCheckExistsError,
  zDbModelsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/models/db-models-find-first-check-exists-error';
import {
  type DbQueriesFindFirstError,
  zDbQueriesFindFirstError
} from '#common/types/backend/function-errors/db/queries/db-queries-find-first-error';
import {
  type EditMalloyQueryError,
  zEditMalloyQueryError
} from '#common/types/backend/function-errors/edit-malloy-query-error';
import {
  type GetChartCheckExistsError,
  zGetChartCheckExistsError
} from '#common/types/backend/function-errors/get-chart-check-exists-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type PrepStoreMconfigQueryError,
  zPrepStoreMconfigQueryError
} from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type GetChartDataError =
  | BackendMemberIsNotExplorerError
  | GetStructCheckExistsError
  | GetChartCheckExistsError
  | DbMconfigsFindFirstCheckExistsError
  | DbModelsFindFirstCheckExistsError
  | CheckChartOrModelAccessError
  | PrepStoreMconfigQueryError
  | EditMalloyQueryError
  | WriteError
  | DbQueriesFindFirstError;

export const zGetChartDataError = z.union([
  zBackendMemberIsNotExplorerError,
  zGetStructCheckExistsError,
  zGetChartCheckExistsError,
  zDbMconfigsFindFirstCheckExistsError,
  zDbModelsFindFirstCheckExistsError,
  zCheckChartOrModelAccessError,
  zPrepStoreMconfigQueryError,
  zEditMalloyQueryError,
  zWriteError,
  zDbQueriesFindFirstError
]);

assertTypesEqual<GetChartDataError, z.infer<typeof zGetChartDataError>>({
  value: true
});
