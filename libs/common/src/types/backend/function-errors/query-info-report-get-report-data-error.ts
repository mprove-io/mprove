import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type GetModelPartXsError,
  zGetModelPartXsError
} from '#common/types/backend/function-errors/get-model-part-xs-error';
import {
  type GetReportCheckExistsAndAccessError,
  zGetReportCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';
import {
  type GetReportDataError,
  zGetReportDataError
} from '#common/types/backend/function-errors/get-report-data-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';

export type QueryInfoReportGetReportDataError =
  | GetStructCheckExistsError
  | GetReportCheckExistsAndAccessError
  | GetReportDataError
  | DbErrorToError
  | GetModelPartXsError;

export const zQueryInfoReportGetReportDataError = z.union([
  zGetStructCheckExistsError,
  zGetReportCheckExistsAndAccessError,
  zGetReportDataError,
  zDbErrorToError,
  zGetModelPartXsError
]);

assertTypesEqual<
  QueryInfoReportGetReportDataError,
  z.infer<typeof zQueryInfoReportGetReportDataError>
>({ value: true });
