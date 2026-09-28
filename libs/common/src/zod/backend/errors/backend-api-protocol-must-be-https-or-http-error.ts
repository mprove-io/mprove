import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiProtocolMustBeHttpsOrHttpError = {
  code: 'BACKEND_API_PROTOCOL_MUST_BE_HTTPS_OR_HTTP';
  displayData?: { url: string };
};

export let zBackendApiProtocolMustBeHttpsOrHttpError = z.object({
  code: z.literal('BACKEND_API_PROTOCOL_MUST_BE_HTTPS_OR_HTTP'),
  displayData: z.object({ url: z.string() }).nullish()
});

assertTypesEqual<
  BackendApiProtocolMustBeHttpsOrHttpError,
  z.infer<typeof zBackendApiProtocolMustBeHttpsOrHttpError>
>({ value: true });
