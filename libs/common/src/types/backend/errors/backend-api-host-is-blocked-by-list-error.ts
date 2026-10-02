import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiHostIsBlockedByListError = {
  code: 'BACKEND_API_HOST_IS_BLOCKED_BY_LIST';
  displayData?: { url: string };
};

export let zBackendApiHostIsBlockedByListError = z.object({
  code: z.literal('BACKEND_API_HOST_IS_BLOCKED_BY_LIST'),
  displayData: z.object({ url: z.string() }).nullish()
});

assertTypesEqual<
  BackendApiHostIsBlockedByListError,
  z.infer<typeof zBackendApiHostIsBlockedByListError>
>({ value: true });
