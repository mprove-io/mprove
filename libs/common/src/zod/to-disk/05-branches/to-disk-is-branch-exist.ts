import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskIsBranchExistRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    isRemote: z.boolean()
  })
  .meta({ id: 'ToDiskIsBranchExistRequestPayload' });

export let zToDiskIsBranchExistRequest = zToDiskRequest
  .extend({
    payload: zToDiskIsBranchExistRequestPayload
  })
  .meta({ id: 'ToDiskIsBranchExistRequest' });

export let zToDiskIsBranchExistResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    branch: z.string(),
    isRemote: z.boolean(),
    isBranchExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsBranchExistResponsePayload' });

export let zToDiskIsBranchExistResponse = zMyResponse
  .extend({
    payload: zToDiskIsBranchExistResponsePayload
  })
  .meta({ id: 'ToDiskIsBranchExistResponse' });

export type ToDiskIsBranchExistRequestPayload = z.infer<
  typeof zToDiskIsBranchExistRequestPayload
>;
export type ToDiskIsBranchExistRequest = z.infer<
  typeof zToDiskIsBranchExistRequest
>;
export type ToDiskIsBranchExistResponsePayload = z.infer<
  typeof zToDiskIsBranchExistResponsePayload
>;
export type ToDiskIsBranchExistResponse = z.infer<
  typeof zToDiskIsBranchExistResponse
>;
