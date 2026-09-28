import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiHostIsBlockedBySpecError = {
  code: 'BACKEND_API_HOST_IS_BLOCKED_BY_SPEC';
  displayData?: { hostname: string; tag: string; type: string };
};

export let zBackendApiHostIsBlockedBySpecError = z.object({
  code: z.literal('BACKEND_API_HOST_IS_BLOCKED_BY_SPEC'),
  displayData: z
    .object({ hostname: z.string(), tag: z.string(), type: z.string() })
    .nullish()
});

assertTypesEqual<
  BackendApiHostIsBlockedBySpecError,
  z.infer<typeof zBackendApiHostIsBlockedBySpecError>
>({ value: true });
