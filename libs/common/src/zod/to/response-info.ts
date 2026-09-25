import { z } from 'zod';
import type { ServerError } from '#common/classes/server-error/server-error';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';

export let zResponseInfo = z
  .object({
    path: z.string().nullish(),
    method: z.string().nullish(),
    mproveVersion: z.string().nullish(),
    duration: z.number().nullish(),
    status: z.enum(ResponseInfoStatusEnum),
    traceId: z.string(),
    error: z.custom<ServerError>().nullish()
  })
  .meta({ id: 'ResponseInfo' });

export type ResponseInfo = z.infer<typeof zResponseInfo>;
