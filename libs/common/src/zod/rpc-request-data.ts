import { z } from 'zod';
import { zMyRequest } from '#common/zod/to/my-request';

export let zRpcRequestData = z
  .object({
    message: zMyRequest,
    replyTo: z.string()
  })
  .meta({ id: 'RpcRequestData' });

export type RpcRequestData = z.infer<typeof zRpcRequestData>;
