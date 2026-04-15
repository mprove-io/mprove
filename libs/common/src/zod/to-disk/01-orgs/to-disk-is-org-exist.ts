import { z } from 'zod';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskIsOrgExistRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskIsOrgExistRequestPayload' });

export let zToDiskIsOrgExistRequest = zToDiskRequest
  .extend({
    payload: zToDiskIsOrgExistRequestPayload
  })
  .meta({ id: 'ToDiskIsOrgExistRequest' });

export let zToDiskIsOrgExistResponsePayload = z
  .object({
    orgId: z.string(),
    isOrgExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsOrgExistResponsePayload' });

export let zToDiskIsOrgExistResponse = zMyResponse
  .extend({
    payload: zToDiskIsOrgExistResponsePayload
  })
  .meta({ id: 'ToDiskIsOrgExistResponse' });

export type ToDiskIsOrgExistRequestPayload = z.infer<
  typeof zToDiskIsOrgExistRequestPayload
>;
export type ToDiskIsOrgExistRequest = z.infer<typeof zToDiskIsOrgExistRequest>;
export type ToDiskIsOrgExistResponsePayload = z.infer<
  typeof zToDiskIsOrgExistResponsePayload
>;
export type ToDiskIsOrgExistResponse = z.infer<
  typeof zToDiskIsOrgExistResponse
>;
