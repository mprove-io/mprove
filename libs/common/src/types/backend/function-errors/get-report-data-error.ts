import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CalculateDataError,
  zCalculateDataError
} from '#common/types/backend/function-errors/calculate-data-error';
import {
  type DbKitsFindManyError,
  zDbKitsFindManyError
} from '#common/types/backend/function-errors/db/kits/db-kits-find-many-error';
import {
  type DbMconfigsFindManyError,
  zDbMconfigsFindManyError
} from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-many-error';
import {
  type DbModelsFindManyError,
  zDbModelsFindManyError
} from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import {
  type DbQueriesFindManyError,
  zDbQueriesFindManyError
} from '#common/types/backend/function-errors/db/queries/db-queries-find-many-error';
import {
  type EditMalloyQueryError,
  zEditMalloyQueryError
} from '#common/types/backend/function-errors/edit-malloy-query-error';
import {
  type GetTimeColumnsError,
  zGetTimeColumnsError
} from '#common/types/backend/function-errors/get-time-columns-error';
import {
  type MakeReportDataColumnsError,
  zMakeReportDataColumnsError
} from '#common/types/backend/function-errors/make-report-data-columns-error';
import {
  type PrepStoreMconfigQueryError,
  zPrepStoreMconfigQueryError
} from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type GetReportDataError =
  | CalculateDataError
  | MakeReportDataColumnsError
  | GetTimeColumnsError
  | PrepStoreMconfigQueryError
  | EditMalloyQueryError
  | WriteError
  | DbModelsFindManyError
  | DbMconfigsFindManyError
  | DbQueriesFindManyError
  | DbKitsFindManyError;

export const zGetReportDataError = z.union([
  zCalculateDataError,
  zMakeReportDataColumnsError,
  zGetTimeColumnsError,
  zPrepStoreMconfigQueryError,
  zEditMalloyQueryError,
  zWriteError,
  zDbModelsFindManyError,
  zDbMconfigsFindManyError,
  zDbQueriesFindManyError,
  zDbKitsFindManyError
]);

assertTypesEqual<GetReportDataError, z.infer<typeof zGetReportDataError>>({
  value: true
});
