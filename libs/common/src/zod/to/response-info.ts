import { z } from 'zod';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';

export let zResponseInfo = z
  .object({
    path: z.string().nullish(),
    method: z.string().nullish(),
    mproveVersion: z.string().nullish(),
    duration: z.number().nullish(),
    status: z.enum(ResponseInfoStatusEnum),
    traceId: z.string(),
    error: z.any().nullish()
  })
  .meta({ id: 'ResponseInfo' });

export type ZResponseInfo = z.infer<typeof zResponseInfo>;
