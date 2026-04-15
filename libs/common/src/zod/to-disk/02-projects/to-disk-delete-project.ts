import { z } from 'zod';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskDeleteProjectRequestPayload = z
  .object({
    orgId: z.string(),
    projectId: z.string()
  })
  .meta({ id: 'ToDiskDeleteProjectRequestPayload' });

export let zToDiskDeleteProjectRequest = zToDiskRequest
  .extend({
    payload: zToDiskDeleteProjectRequestPayload
  })
  .meta({ id: 'ToDiskDeleteProjectRequest' });

export let zToDiskDeleteProjectResponsePayload = z
  .object({
    orgId: z.string(),
    deletedProjectId: z.string()
  })
  .meta({ id: 'ToDiskDeleteProjectResponsePayload' });

export let zToDiskDeleteProjectResponse = zMyResponse
  .extend({
    payload: zToDiskDeleteProjectResponsePayload
  })
  .meta({ id: 'ToDiskDeleteProjectResponse' });

export type ToDiskDeleteProjectRequestPayload = z.infer<
  typeof zToDiskDeleteProjectRequestPayload
>;
export type ToDiskDeleteProjectRequest = z.infer<
  typeof zToDiskDeleteProjectRequest
>;
export type ToDiskDeleteProjectResponsePayload = z.infer<
  typeof zToDiskDeleteProjectResponsePayload
>;
export type ToDiskDeleteProjectResponse = z.infer<
  typeof zToDiskDeleteProjectResponse
>;
