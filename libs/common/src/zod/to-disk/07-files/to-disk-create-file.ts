import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCreateFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    userAlias: z.string(),
    parentNodeId: z.string(),
    fileName: z.string(),
    fileText: z.string().nullish()
  })
  .meta({ id: 'ToDiskCreateFileRequestPayload' });

export let zToDiskCreateFileRequest = zToDiskRequest
  .extend({
    payload: zToDiskCreateFileRequestPayload
  })
  .meta({ id: 'ToDiskCreateFileRequest' });

export let zToDiskCreateFileResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateFileResponsePayload' });

export let zToDiskCreateFileResponse = zMyResponse
  .extend({
    payload: zToDiskCreateFileResponsePayload
  })
  .meta({ id: 'ToDiskCreateFileResponse' });

export type ToDiskCreateFileRequestPayload = z.infer<
  typeof zToDiskCreateFileRequestPayload
>;
export type ToDiskCreateFileRequest = z.infer<typeof zToDiskCreateFileRequest>;
export type ToDiskCreateFileResponsePayload = z.infer<
  typeof zToDiskCreateFileResponsePayload
>;
export type ToDiskCreateFileResponse = z.infer<
  typeof zToDiskCreateFileResponse
>;
