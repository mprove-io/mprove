import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendConnectionTypeIsNotSupportedForSampleError = {
  code: 'BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE';
};

export let zBackendConnectionTypeIsNotSupportedForSampleError = z.object({
  code: z.literal('BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE')
});

assertTypesEqual<
  BackendConnectionTypeIsNotSupportedForSampleError,
  z.infer<typeof zBackendConnectionTypeIsNotSupportedForSampleError>
>({ value: true });
