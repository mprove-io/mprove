import { z } from 'zod';
import { zMyRequest } from '#common/zod/to/my-request';
import { zToBlockmlRequestInfo } from '#common/zod/to-blockml/to-blockml-request-info';

export let zToBlockmlRequest = zMyRequest
  .extend({
    info: zToBlockmlRequestInfo
  })
  .meta({ id: 'ToBlockmlRequest' });

export type ToBlockmlRequest = z.infer<typeof zToBlockmlRequest>;
