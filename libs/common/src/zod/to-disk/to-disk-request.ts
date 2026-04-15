import { z } from 'zod';
import { zMyRequest } from '#common/zod/to/my-request';
import { zToDiskRequestInfo } from '#common/zod/to-disk/to-disk-request-info';

export let zToDiskRequest = zMyRequest
  .extend({
    info: zToDiskRequestInfo
  })
  .meta({ id: 'ToDiskRequest' });

export type ToDiskRequest = z.infer<typeof zToDiskRequest>;
