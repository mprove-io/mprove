import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskSeedProjectRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    testProjectId: z.string().nullish(),
    devRepoId: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskSeedProjectRequestPayload' });

export let zToDiskSeedProjectRequest = zToDiskRequest
  .extend({
    payload: zToDiskSeedProjectRequestPayload
  })
  .meta({ id: 'ToDiskSeedProjectRequest' });

export let zToDiskSeedProjectResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskSeedProjectResponsePayload' });

export let zToDiskSeedProjectResponse = zMyResponse
  .extend({
    payload: zToDiskSeedProjectResponsePayload
  })
  .meta({ id: 'ToDiskSeedProjectResponse' });

export type ToDiskSeedProjectRequestPayload = z.infer<
  typeof zToDiskSeedProjectRequestPayload
>;
export type ToDiskSeedProjectRequest = z.infer<
  typeof zToDiskSeedProjectRequest
>;
export type ToDiskSeedProjectResponsePayload = z.infer<
  typeof zToDiskSeedProjectResponsePayload
>;
export type ToDiskSeedProjectResponse = z.infer<
  typeof zToDiskSeedProjectResponse
>;
