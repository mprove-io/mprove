import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type GetQueryInfoReportDataError =
  | GetStructCheckExistsError
  | GetReportCheckExistsAndAccessError
  | GetReportDataError
  | WriteError
  | GetModelPartXsError;

export const zGetQueryInfoReportDataError = z.union([
  zGetStructCheckExistsError,
  zGetReportCheckExistsAndAccessError,
  zGetReportDataError,
  zWriteError,
  zGetModelPartXsError
]);

assertTypesEqual<
  GetQueryInfoReportDataError,
  z.infer<typeof zGetQueryInfoReportDataError>
>({ value: true });
