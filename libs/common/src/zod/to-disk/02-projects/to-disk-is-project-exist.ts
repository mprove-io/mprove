import { z } from 'zod';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskIsProjectExistRequestPayload = z
  .object({
    orgId: z.string(),
    projectId: z.string()
  })
  .meta({ id: 'ToDiskIsProjectExistRequestPayload' });

export let zToDiskIsProjectExistRequest = zToDiskRequest
  .extend({
    payload: zToDiskIsProjectExistRequestPayload
  })
  .meta({ id: 'ToDiskIsProjectExistRequest' });

export let zToDiskIsProjectExistResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    isProjectExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsProjectExistResponsePayload' });

export let zToDiskIsProjectExistResponse = zMyResponse
  .extend({
    payload: zToDiskIsProjectExistResponsePayload
  })
  .meta({ id: 'ToDiskIsProjectExistResponse' });

export type ToDiskIsProjectExistRequestPayload = z.infer<
  typeof zToDiskIsProjectExistRequestPayload
>;
export type ToDiskIsProjectExistRequest = z.infer<
  typeof zToDiskIsProjectExistRequest
>;
export type ToDiskIsProjectExistResponsePayload = z.infer<
  typeof zToDiskIsProjectExistResponsePayload
>;
export type ToDiskIsProjectExistResponse = z.infer<
  typeof zToDiskIsProjectExistResponse
>;
