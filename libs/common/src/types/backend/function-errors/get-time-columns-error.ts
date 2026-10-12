import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongTimeRangeError,
  zBackendWrongTimeRangeError
} from '#common/types/backend/errors/backend-wrong-time-range-error';

export type GetTimeColumnsError = BackendWrongTimeRangeError;

export const zGetTimeColumnsError = zBackendWrongTimeRangeError;

assertTypesEqual<GetTimeColumnsError, z.infer<typeof zGetTimeColumnsError>>({
  value: true
});
