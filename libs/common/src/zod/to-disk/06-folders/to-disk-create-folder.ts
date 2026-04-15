import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCreateFolderRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    parentNodeId: z.string(),
    folderName: z.string()
  })
  .meta({ id: 'ToDiskCreateFolderRequestPayload' });

export let zToDiskCreateFolderRequest = zToDiskRequest
  .extend({
    payload: zToDiskCreateFolderRequestPayload
  })
  .meta({ id: 'ToDiskCreateFolderRequest' });

export let zToDiskCreateFolderResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateFolderResponsePayload' });

export let zToDiskCreateFolderResponse = zMyResponse
  .extend({
    payload: zToDiskCreateFolderResponsePayload
  })
  .meta({ id: 'ToDiskCreateFolderResponse' });

export type ToDiskCreateFolderRequestPayload = z.infer<
  typeof zToDiskCreateFolderRequestPayload
>;
export type ToDiskCreateFolderRequest = z.infer<
  typeof zToDiskCreateFolderRequest
>;
export type ToDiskCreateFolderResponsePayload = z.infer<
  typeof zToDiskCreateFolderResponsePayload
>;
export type ToDiskCreateFolderResponse = z.infer<
  typeof zToDiskCreateFolderResponse
>;
