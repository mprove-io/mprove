import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskRenameCatalogNodeRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    nodeId: z.string(),
    newName: z.string()
  })
  .meta({ id: 'ToDiskRenameCatalogNodeRequestPayload' });

export let zToDiskRenameCatalogNodeRequest = zToDiskRequest
  .extend({
    payload: zToDiskRenameCatalogNodeRequestPayload
  })
  .meta({ id: 'ToDiskRenameCatalogNodeRequest' });

export let zToDiskRenameCatalogNodeResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRenameCatalogNodeResponsePayload' });

export let zToDiskRenameCatalogNodeResponse = zMyResponse
  .extend({
    payload: zToDiskRenameCatalogNodeResponsePayload
  })
  .meta({ id: 'ToDiskRenameCatalogNodeResponse' });

export type ToDiskRenameCatalogNodeRequestPayload = z.infer<
  typeof zToDiskRenameCatalogNodeRequestPayload
>;
export type ToDiskRenameCatalogNodeRequest = z.infer<
  typeof zToDiskRenameCatalogNodeRequest
>;
export type ToDiskRenameCatalogNodeResponsePayload = z.infer<
  typeof zToDiskRenameCatalogNodeResponsePayload
>;
export type ToDiskRenameCatalogNodeResponse = z.infer<
  typeof zToDiskRenameCatalogNodeResponse
>;
