import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCommitRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    userAlias: z.string(),
    commitMessage: z.string()
  })
  .meta({ id: 'ToDiskCommitRepoRequestPayload' });

export let zToDiskCommitRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskCommitRepoRequestPayload
  })
  .meta({ id: 'ToDiskCommitRepoRequest' });

export let zToDiskCommitRepoResponsePayload = z
  .object({
    repo: zRepo
  })
  .meta({ id: 'ToDiskCommitRepoResponsePayload' });

export let zToDiskCommitRepoResponse = zMyResponse
  .extend({
    payload: zToDiskCommitRepoResponsePayload
  })
  .meta({ id: 'ToDiskCommitRepoResponse' });

export type ToDiskCommitRepoRequestPayload = z.infer<
  typeof zToDiskCommitRepoRequestPayload
>;
export type ToDiskCommitRepoRequest = z.infer<typeof zToDiskCommitRepoRequest>;
export type ToDiskCommitRepoResponsePayload = z.infer<
  typeof zToDiskCommitRepoResponsePayload
>;
export type ToDiskCommitRepoResponse = z.infer<
  typeof zToDiskCommitRepoResponse
>;
