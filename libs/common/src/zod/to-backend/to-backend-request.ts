import { z } from 'zod';
import { zMyRequest } from '#common/zod/to/my-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRequest = zMyRequest
  .extend({
    info: zToBackendRequestInfo
  })
  .meta({ id: 'ToBackendRequest' });

export type ToBackendRequest = z.infer<typeof zToBackendRequest>;
