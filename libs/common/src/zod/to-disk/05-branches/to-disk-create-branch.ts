import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCreateBranchRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    newBranch: z.string(),
    fromBranch: z.string(),
    isFromRemote: z.boolean()
  })
  .meta({ id: 'ToDiskCreateBranchRequestPayload' });

export let zToDiskCreateBranchRequest = zToDiskRequest
  .extend({
    payload: zToDiskCreateBranchRequestPayload
  })
  .meta({ id: 'ToDiskCreateBranchRequest' });

export let zToDiskCreateBranchResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateBranchResponsePayload' });

export let zToDiskCreateBranchResponse = zMyResponse
  .extend({
    payload: zToDiskCreateBranchResponsePayload
  })
  .meta({ id: 'ToDiskCreateBranchResponse' });

export type ToDiskCreateBranchRequestPayload = z.infer<
  typeof zToDiskCreateBranchRequestPayload
>;
export type ToDiskCreateBranchRequest = z.infer<
  typeof zToDiskCreateBranchRequest
>;
export type ToDiskCreateBranchResponsePayload = z.infer<
  typeof zToDiskCreateBranchResponsePayload
>;
export type ToDiskCreateBranchResponse = z.infer<
  typeof zToDiskCreateBranchResponse
>;
