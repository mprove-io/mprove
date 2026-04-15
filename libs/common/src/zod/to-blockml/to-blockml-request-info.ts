import { z } from 'zod';
import { ToBlockmlRequestInfoNameEnum } from '#common/enums/to/to-blockml-request-info-name.enum';
import { zRequestInfo } from '#common/zod/to/request-info';

export let zToBlockmlRequestInfo = zRequestInfo
  .extend({
    name: z.enum(ToBlockmlRequestInfoNameEnum),
    traceId: z.string()
  })
  .meta({ id: 'ToBlockmlRequestInfo' });

export type ToBlockmlRequestInfo = z.infer<typeof zToBlockmlRequestInfo>;
