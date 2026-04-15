import { z } from 'zod';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCreateOrgRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskCreateOrgRequestPayload' });

export let zToDiskCreateOrgRequest = zToDiskRequest
  .extend({
    payload: zToDiskCreateOrgRequestPayload
  })
  .meta({ id: 'ToDiskCreateOrgRequest' });

export let zToDiskCreateOrgResponsePayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskCreateOrgResponsePayload' });

export let zToDiskCreateOrgResponse = zMyResponse
  .extend({
    payload: zToDiskCreateOrgResponsePayload
  })
  .meta({ id: 'ToDiskCreateOrgResponse' });

export type ToDiskCreateOrgRequestPayload = z.infer<
  typeof zToDiskCreateOrgRequestPayload
>;
export type ToDiskCreateOrgRequest = z.infer<typeof zToDiskCreateOrgRequest>;
export type ToDiskCreateOrgResponsePayload = z.infer<
  typeof zToDiskCreateOrgResponsePayload
>;
export type ToDiskCreateOrgResponse = z.infer<typeof zToDiskCreateOrgResponse>;
