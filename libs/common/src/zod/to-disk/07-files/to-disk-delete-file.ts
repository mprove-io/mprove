import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskDeleteFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fileNodeId: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskDeleteFileRequestPayload' });

export let zToDiskDeleteFileRequest = zToDiskRequest
  .extend({
    payload: zToDiskDeleteFileRequestPayload
  })
  .meta({ id: 'ToDiskDeleteFileRequest' });

export let zToDiskDeleteFileResponsePayload = z
  .object({
    repo: zRepo,
    deletedFileNodeId: z.string(),
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskDeleteFileResponsePayload' });

export let zToDiskDeleteFileResponse = zMyResponse
  .extend({
    payload: zToDiskDeleteFileResponsePayload
  })
  .meta({ id: 'ToDiskDeleteFileResponse' });

export type ToDiskDeleteFileRequestPayload = z.infer<
  typeof zToDiskDeleteFileRequestPayload
>;
export type ToDiskDeleteFileRequest = z.infer<typeof zToDiskDeleteFileRequest>;
export type ToDiskDeleteFileResponsePayload = z.infer<
  typeof zToDiskDeleteFileResponsePayload
>;
export type ToDiskDeleteFileResponse = z.infer<
  typeof zToDiskDeleteFileResponse
>;
