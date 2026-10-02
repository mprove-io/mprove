import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiHostIsBlockedBySuffixError = {
  code: 'BACKEND_API_HOST_IS_BLOCKED_BY_SUFFIX';
  displayData?: { hostname: string; tag: string; type: string };
};

export let zBackendApiHostIsBlockedBySuffixError = z.object({
  code: z.literal('BACKEND_API_HOST_IS_BLOCKED_BY_SUFFIX'),
  displayData: z
    .object({ hostname: z.string(), tag: z.string(), type: z.string() })
    .nullish()
});

assertTypesEqual<
  BackendApiHostIsBlockedBySuffixError,
  z.infer<typeof zBackendApiHostIsBlockedBySuffixError>
>({ value: true });
