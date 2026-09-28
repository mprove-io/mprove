import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiHostDnsLookupFailedError = {
  code: 'BACKEND_API_HOST_DNS_LOOKUP_FAILED';
  displayData?: { hostname: string };
};

export let zBackendApiHostDnsLookupFailedError = z.object({
  code: z.literal('BACKEND_API_HOST_DNS_LOOKUP_FAILED'),
  displayData: z.object({ hostname: z.string() }).nullish()
});

assertTypesEqual<
  BackendApiHostDnsLookupFailedError,
  z.infer<typeof zBackendApiHostDnsLookupFailedError>
>({ value: true });
