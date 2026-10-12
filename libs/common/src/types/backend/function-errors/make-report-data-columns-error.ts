import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDateConversionFailedError,
  zBackendDateConversionFailedError
} from '#common/types/backend/errors/backend-date-conversion-failed-error';

export type MakeReportDataColumnsError = BackendDateConversionFailedError;

export const zMakeReportDataColumnsError = zBackendDateConversionFailedError;

assertTypesEqual<
  MakeReportDataColumnsError,
  z.infer<typeof zMakeReportDataColumnsError>
>({ value: true });
