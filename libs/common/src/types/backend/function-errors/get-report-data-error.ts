import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CalculateDataError,
  zCalculateDataError
} from '#common/types/backend/function-errors/calculate-data-error';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type EditMalloyQueryError,
  zEditMalloyQueryError
} from '#common/types/backend/function-errors/edit-malloy-query-error';
import {
  type GetTimeColumnsError,
  zGetTimeColumnsError
} from '#common/types/backend/function-errors/get-time-columns-error';
import {
  type KitEntToTabError,
  zKitEntToTabError
} from '#common/types/backend/function-errors/kit-ent-to-tab-error';
import {
  type MakeReportDataColumnsError,
  zMakeReportDataColumnsError
} from '#common/types/backend/function-errors/make-report-data-columns-error';
import {
  type MconfigEntToTabError,
  zMconfigEntToTabError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';
import {
  type PrepStoreMconfigQueryError,
  zPrepStoreMconfigQueryError
} from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type GetReportDataError =
  | CalculateDataError
  | MakeReportDataColumnsError
  | GetTimeColumnsError
  | ModelEntToTabError
  | PrepStoreMconfigQueryError
  | EditMalloyQueryError
  | MconfigEntToTabError
  | QueryEntToTabError
  | KitEntToTabError
  | DbErrorToError;

export const zGetReportDataError = z.union([
  zCalculateDataError,
  zMakeReportDataColumnsError,
  zGetTimeColumnsError,
  zModelEntToTabError,
  zPrepStoreMconfigQueryError,
  zEditMalloyQueryError,
  zMconfigEntToTabError,
  zQueryEntToTabError,
  zKitEntToTabError,
  zDbErrorToError
]);

assertTypesEqual<GetReportDataError, z.infer<typeof zGetReportDataError>>({
  value: true
});
