import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskDeleteDevRepoRequestPayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    baseProject: zBaseProject,
    devRepoId: z.string()
  })
  .meta({ id: 'ToDiskDeleteDevRepoRequestPayload' });

export let zToDiskDeleteDevRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskDeleteDevRepoRequestPayload
  })
  .meta({ id: 'ToDiskDeleteDevRepoRequest' });

export let zToDiskDeleteDevRepoResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    deletedRepoId: z.string()
  })
  .meta({ id: 'ToDiskDeleteDevRepoResponsePayload' });

export let zToDiskDeleteDevRepoResponse = zMyResponse
  .extend({
    payload: zToDiskDeleteDevRepoResponsePayload
  })
  .meta({ id: 'ToDiskDeleteDevRepoResponse' });

export type ToDiskDeleteDevRepoRequestPayload = z.infer<
  typeof zToDiskDeleteDevRepoRequestPayload
>;
export type ToDiskDeleteDevRepoRequest = z.infer<
  typeof zToDiskDeleteDevRepoRequest
>;
export type ToDiskDeleteDevRepoResponsePayload = z.infer<
  typeof zToDiskDeleteDevRepoResponsePayload
>;
export type ToDiskDeleteDevRepoResponse = z.infer<
  typeof zToDiskDeleteDevRepoResponse
>;
