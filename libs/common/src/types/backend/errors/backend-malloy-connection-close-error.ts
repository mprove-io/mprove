import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMalloyConnectionCloseError = {
  code: 'BACKEND_MALLOY_CONNECTION_CLOSE_ERROR';
};

export let zBackendMalloyConnectionCloseError = z.object({
  code: z.literal('BACKEND_MALLOY_CONNECTION_CLOSE_ERROR')
});

assertTypesEqual<
  BackendMalloyConnectionCloseError,
  z.infer<typeof zBackendMalloyConnectionCloseError>
>({ value: true });
