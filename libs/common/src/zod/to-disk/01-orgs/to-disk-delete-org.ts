import { z } from 'zod';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskDeleteOrgRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskDeleteOrgRequestPayload' });

export let zToDiskDeleteOrgRequest = zToDiskRequest
  .extend({
    payload: zToDiskDeleteOrgRequestPayload
  })
  .meta({ id: 'ToDiskDeleteOrgRequest' });

export let zToDiskDeleteOrgResponsePayload = z
  .object({
    deletedOrgId: z.string()
  })
  .meta({ id: 'ToDiskDeleteOrgResponsePayload' });

export let zToDiskDeleteOrgResponse = zMyResponse
  .extend({
    payload: zToDiskDeleteOrgResponsePayload
  })
  .meta({ id: 'ToDiskDeleteOrgResponse' });

export type ToDiskDeleteOrgRequestPayload = z.infer<
  typeof zToDiskDeleteOrgRequestPayload
>;
export type ToDiskDeleteOrgRequest = z.infer<typeof zToDiskDeleteOrgRequest>;
export type ToDiskDeleteOrgResponsePayload = z.infer<
  typeof zToDiskDeleteOrgResponsePayload
>;
export type ToDiskDeleteOrgResponse = z.infer<typeof zToDiskDeleteOrgResponse>;
