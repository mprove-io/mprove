import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { zRequestInfo } from '#common/zod/to/request-info';

export let zToDiskRequestInfo = zRequestInfo
  .extend({
    name: z.enum(ToDiskRequestInfoNameEnum),
    traceId: z.string()
  })
  .meta({ id: 'ToDiskRequestInfo' });

export type ToDiskRequestInfo = z.infer<typeof zToDiskRequestInfo>;
