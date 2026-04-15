import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskDeleteFolderRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    folderNodeId: z.string()
  })
  .meta({ id: 'ToDiskDeleteFolderRequestPayload' });

export let zToDiskDeleteFolderRequest = zToDiskRequest
  .extend({
    payload: zToDiskDeleteFolderRequestPayload
  })
  .meta({ id: 'ToDiskDeleteFolderRequest' });

export let zToDiskDeleteFolderResponsePayload = z
  .object({
    repo: zRepo,
    deletedFolderNodeId: z.string(),
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskDeleteFolderResponsePayload' });

export let zToDiskDeleteFolderResponse = zMyResponse
  .extend({
    payload: zToDiskDeleteFolderResponsePayload
  })
  .meta({ id: 'ToDiskDeleteFolderResponse' });

export type ToDiskDeleteFolderRequestPayload = z.infer<
  typeof zToDiskDeleteFolderRequestPayload
>;
export type ToDiskDeleteFolderRequest = z.infer<
  typeof zToDiskDeleteFolderRequest
>;
export type ToDiskDeleteFolderResponsePayload = z.infer<
  typeof zToDiskDeleteFolderResponsePayload
>;
export type ToDiskDeleteFolderResponse = z.infer<
  typeof zToDiskDeleteFolderResponse
>;
