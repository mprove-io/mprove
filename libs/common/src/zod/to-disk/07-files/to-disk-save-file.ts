import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskSaveFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fileNodeId: z.string(),
    content: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskSaveFileRequestPayload' });

export let zToDiskSaveFileRequest = zToDiskRequest
  .extend({
    payload: zToDiskSaveFileRequestPayload
  })
  .meta({ id: 'ToDiskSaveFileRequest' });

export let zToDiskSaveFileResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskSaveFileResponsePayload' });

export let zToDiskSaveFileResponse = zMyResponse
  .extend({
    payload: zToDiskSaveFileResponsePayload
  })
  .meta({ id: 'ToDiskSaveFileResponse' });

export type ToDiskSaveFileRequestPayload = z.infer<
  typeof zToDiskSaveFileRequestPayload
>;
export type ToDiskSaveFileRequest = z.infer<typeof zToDiskSaveFileRequest>;
export type ToDiskSaveFileResponsePayload = z.infer<
  typeof zToDiskSaveFileResponsePayload
>;
export type ToDiskSaveFileResponse = z.infer<typeof zToDiskSaveFileResponse>;
