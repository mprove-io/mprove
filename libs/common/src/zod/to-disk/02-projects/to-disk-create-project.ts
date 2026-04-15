import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCreateProjectRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    testProjectId: z.string().nullish(),
    devRepoId: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskCreateProjectRequestPayload' });

export let zToDiskCreateProjectRequest = zToDiskRequest
  .extend({
    payload: zToDiskCreateProjectRequestPayload
  })
  .meta({ id: 'ToDiskCreateProjectRequest' });

export let zToDiskCreateProjectResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    defaultBranch: z.string(),
    prodFiles: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateProjectResponsePayload' });

export let zToDiskCreateProjectResponse = zMyResponse
  .extend({
    payload: zToDiskCreateProjectResponsePayload
  })
  .meta({ id: 'ToDiskCreateProjectResponse' });

export type ToDiskCreateProjectRequestPayload = z.infer<
  typeof zToDiskCreateProjectRequestPayload
>;
export type ToDiskCreateProjectRequest = z.infer<
  typeof zToDiskCreateProjectRequest
>;
export type ToDiskCreateProjectResponsePayload = z.infer<
  typeof zToDiskCreateProjectResponsePayload
>;
export type ToDiskCreateProjectResponse = z.infer<
  typeof zToDiskCreateProjectResponse
>;
