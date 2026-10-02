import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDateConversionFailedError = {
  code: 'BACKEND_DATE_CONVERSION_FAILED';
};

export let zBackendDateConversionFailedError = z.object({
  code: z.literal('BACKEND_DATE_CONVERSION_FAILED')
});

assertTypesEqual<
  BackendDateConversionFailedError,
  z.infer<typeof zBackendDateConversionFailedError>
>({ value: true });
