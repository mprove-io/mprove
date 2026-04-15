import { z } from 'zod';

export let zRequestInfo = z
  .object({
    name: z.any(),
    traceId: z.string()
  })
  .meta({ id: 'RequestInfo' });

export type RequestInfo = z.infer<typeof zRequestInfo>;
