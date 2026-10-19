import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeReportDataColumnsError,
  zMakeReportDataColumnsError
} from '#common/types/backend/function-errors/make-report-data-columns-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type CalculateDataError = MakeReportDataColumnsError | WriteError;

export const zCalculateDataError = z.union([
  zMakeReportDataColumnsError,
  zWriteError
]);

assertTypesEqual<CalculateDataError, z.infer<typeof zCalculateDataError>>({
  value: true
});
