import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionTypeIsNotSupportedForSampleError,
  zBackendConnectionTypeIsNotSupportedForSampleError
} from '#common/types/backend/errors/backend-connection-type-is-not-supported-for-sample-error';

export type FetchCachedPartsError =
  BackendConnectionTypeIsNotSupportedForSampleError;

export const zFetchCachedPartsError =
  zBackendConnectionTypeIsNotSupportedForSampleError;

assertTypesEqual<FetchCachedPartsError, z.infer<typeof zFetchCachedPartsError>>(
  {
    value: true
  }
);
