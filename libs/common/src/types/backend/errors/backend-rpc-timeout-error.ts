import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRpcTimeoutError = {
  code: 'BACKEND_RPC_TIMEOUT';
};

export let zBackendRpcTimeoutError = z.object({
  code: z.literal('BACKEND_RPC_TIMEOUT')
});

assertTypesEqual<
  BackendRpcTimeoutError,
  z.infer<typeof zBackendRpcTimeoutError>
>({ value: true });
