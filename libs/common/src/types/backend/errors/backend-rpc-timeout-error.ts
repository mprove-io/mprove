import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRpcTimeoutError = {
  code: 'BACKEND_RPC_TIMEOUT';
  customData?: {
    timeout: string;
  };
};

export let zBackendRpcTimeoutError = z.object({
  code: z.literal('BACKEND_RPC_TIMEOUT'),
  customData: z
    .object({
      timeout: z.string()
    })
    .nullish()
});

assertTypesEqual<
  BackendRpcTimeoutError,
  z.infer<typeof zBackendRpcTimeoutError>
>({ value: true });
