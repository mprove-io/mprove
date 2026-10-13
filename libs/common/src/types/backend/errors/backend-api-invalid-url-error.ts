import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiInvalidUrlError = {
  code: 'BACKEND_API_INVALID_URL';
  displayData?: { url: string };
  customData?: {
    originalError?: unknown;
  };
};

export let zBackendApiInvalidUrlError = z.object({
  code: z.literal('BACKEND_API_INVALID_URL'),
  displayData: z.object({ url: z.string() }).nullish(),
  customData: z
    .object({
      originalError: z.unknown().nullish()
    })
    .nullish()
});

assertTypesEqual<
  BackendApiInvalidUrlError,
  z.infer<typeof zBackendApiInvalidUrlError>
>({ value: true });
