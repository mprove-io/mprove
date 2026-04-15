import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskGetCatalogFilesRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskGetCatalogFilesRequestPayload' });

export let zToDiskGetCatalogFilesRequest = zToDiskRequest
  .extend({
    payload: zToDiskGetCatalogFilesRequestPayload
  })
  .meta({ id: 'ToDiskGetCatalogFilesRequest' });

export let zToDiskGetCatalogFilesResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskGetCatalogFilesResponsePayload' });

export let zToDiskGetCatalogFilesResponse = zMyResponse
  .extend({
    payload: zToDiskGetCatalogFilesResponsePayload
  })
  .meta({ id: 'ToDiskGetCatalogFilesResponse' });

export type ToDiskGetCatalogFilesRequestPayload = z.infer<
  typeof zToDiskGetCatalogFilesRequestPayload
>;
export type ToDiskGetCatalogFilesRequest = z.infer<
  typeof zToDiskGetCatalogFilesRequest
>;
export type ToDiskGetCatalogFilesResponsePayload = z.infer<
  typeof zToDiskGetCatalogFilesResponsePayload
>;
export type ToDiskGetCatalogFilesResponse = z.infer<
  typeof zToDiskGetCatalogFilesResponse
>;
