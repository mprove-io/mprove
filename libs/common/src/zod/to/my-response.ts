import { z } from 'zod';
import { zResponseInfo } from '#common/zod/to/response-info';

export let zMyResponse = z
  .object({
    info: zResponseInfo,
    payload: z.any()
  })
  .meta({ id: 'MyResponse' });

export type MyResponse = z.infer<typeof zMyResponse>;
