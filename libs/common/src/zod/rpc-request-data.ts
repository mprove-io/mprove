import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type RpcRequestData = {
  message: unknown;
  replyTo: string;
};

export let zRpcRequestData = z
  .object({
    message: z.unknown(),
    replyTo: z.string()
  })
  .meta({ id: 'RpcRequestData' });

assertTypesEqual<RpcRequestData, z.infer<typeof zRpcRequestData>>({
  value: true
});
