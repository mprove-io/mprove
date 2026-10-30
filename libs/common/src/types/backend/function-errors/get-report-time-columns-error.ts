import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongTimeRangeError,
  zBackendWrongTimeRangeError
} from '#common/types/backend/errors/backend-wrong-time-range-error';

export type GetReportTimeColumnsError = BackendWrongTimeRangeError;

export const zGetReportTimeColumnsError = zBackendWrongTimeRangeError;

assertTypesEqual<
  GetReportTimeColumnsError,
  z.infer<typeof zGetReportTimeColumnsError>
>({
  value: true
});
