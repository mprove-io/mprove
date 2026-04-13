import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zRequestInfo } from '#common/zod/to/request-info';

export let zToBackendRequestInfo = zRequestInfo
  .extend({
    name: z.enum(ToBackendRequestInfoNameEnum),
    traceId: z.string(),
    idempotencyKey: z.string()
  })
  .meta({ id: 'ToBackendRequestInfo' });

export type ZToBackendRequestInfo = z.infer<typeof zToBackendRequestInfo>;
