import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRpcInvalidResponseFormatError = {
  code: 'BACKEND_RPC_INVALID_RESPONSE_FORMAT';
};

export let zBackendRpcInvalidResponseFormatError = z.object({
  code: z.literal('BACKEND_RPC_INVALID_RESPONSE_FORMAT')
});

assertTypesEqual<
  BackendRpcInvalidResponseFormatError,
  z.infer<typeof zBackendRpcInvalidResponseFormatError>
>({ value: true });
