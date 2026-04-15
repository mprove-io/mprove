import { z } from 'zod';
import { zRequestInfo } from '#common/zod/to/request-info';

export let zMyRequest = z
  .object({
    info: zRequestInfo,
    payload: z.any()
  })
  .meta({ id: 'MyRequest' });

export type MyRequest = z.infer<typeof zMyRequest>;
