import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskDeleteBranchRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskDeleteBranchRequestPayload' });

export let zToDiskDeleteBranchRequest = zToDiskRequest
  .extend({
    payload: zToDiskDeleteBranchRequestPayload
  })
  .meta({ id: 'ToDiskDeleteBranchRequest' });

export let zToDiskDeleteBranchResponsePayload = z
  .object({
    repo: zRepo,
    deletedBranch: z.string()
  })
  .meta({ id: 'ToDiskDeleteBranchResponsePayload' });

export let zToDiskDeleteBranchResponse = zMyResponse
  .extend({
    payload: zToDiskDeleteBranchResponsePayload
  })
  .meta({ id: 'ToDiskDeleteBranchResponse' });

export type ToDiskDeleteBranchRequestPayload = z.infer<
  typeof zToDiskDeleteBranchRequestPayload
>;
export type ToDiskDeleteBranchRequest = z.infer<
  typeof zToDiskDeleteBranchRequest
>;
export type ToDiskDeleteBranchResponsePayload = z.infer<
  typeof zToDiskDeleteBranchResponsePayload
>;
export type ToDiskDeleteBranchResponse = z.infer<
  typeof zToDiskDeleteBranchResponse
>;
