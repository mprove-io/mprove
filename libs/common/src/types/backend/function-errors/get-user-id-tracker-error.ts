import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendThrottlerUserIdIsNotDefinedError,
  zBackendThrottlerUserIdIsNotDefinedError
} from '#common/types/backend/errors/backend-throttler-user-id-is-not-defined-error';

export type GetUserIdTrackerError = BackendThrottlerUserIdIsNotDefinedError;

export const zGetUserIdTrackerError = zBackendThrottlerUserIdIsNotDefinedError;

assertTypesEqual<GetUserIdTrackerError, z.infer<typeof zGetUserIdTrackerError>>(
  {
    value: true
  }
);
