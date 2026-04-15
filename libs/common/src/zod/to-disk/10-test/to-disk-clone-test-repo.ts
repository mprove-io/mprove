import { z } from 'zod';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCloneTestRepoRequestPayload = z
  .object({
    testId: z.string()
  })
  .meta({ id: 'ToDiskCloneTestRepoRequestPayload' });

export let zToDiskCloneTestRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskCloneTestRepoRequestPayload
  })
  .meta({ id: 'ToDiskCloneTestRepoRequest' });

export let zToDiskCloneTestRepoResponse = zMyResponse
  .extend({
    payload: z.object({})
  })
  .meta({ id: 'ToDiskCloneTestRepoResponse' });

export type ToDiskCloneTestRepoRequestPayload = z.infer<
  typeof zToDiskCloneTestRepoRequestPayload
>;
export type ToDiskCloneTestRepoRequest = z.infer<
  typeof zToDiskCloneTestRepoRequest
>;
export type ToDiskCloneTestRepoResponse = z.infer<
  typeof zToDiskCloneTestRepoResponse
>;
