import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type MakeReportDataColumnsError,
  zMakeReportDataColumnsError
} from '#common/types/backend/function-errors/make-report-data-columns-error';

export type CalculateDataError = MakeReportDataColumnsError | DbErrorToError;

export const zCalculateDataError = z.union([
  zMakeReportDataColumnsError,
  zDbErrorToError
]);

assertTypesEqual<CalculateDataError, z.infer<typeof zCalculateDataError>>({
  value: true
});
