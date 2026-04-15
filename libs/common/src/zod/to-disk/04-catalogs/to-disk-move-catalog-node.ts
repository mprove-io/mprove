import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskMoveCatalogNodeRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fromNodeId: z.string(),
    toNodeId: z.string()
  })
  .meta({ id: 'ToDiskMoveCatalogNodeRequestPayload' });

export let zToDiskMoveCatalogNodeRequest = zToDiskRequest
  .extend({
    payload: zToDiskMoveCatalogNodeRequestPayload
  })
  .meta({ id: 'ToDiskMoveCatalogNodeRequest' });

export let zToDiskMoveCatalogNodeResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskMoveCatalogNodeResponsePayload' });

export let zToDiskMoveCatalogNodeResponse = zMyResponse
  .extend({
    payload: zToDiskMoveCatalogNodeResponsePayload
  })
  .meta({ id: 'ToDiskMoveCatalogNodeResponse' });

export type ToDiskMoveCatalogNodeRequestPayload = z.infer<
  typeof zToDiskMoveCatalogNodeRequestPayload
>;
export type ToDiskMoveCatalogNodeRequest = z.infer<
  typeof zToDiskMoveCatalogNodeRequest
>;
export type ToDiskMoveCatalogNodeResponsePayload = z.infer<
  typeof zToDiskMoveCatalogNodeResponsePayload
>;
export type ToDiskMoveCatalogNodeResponse = z.infer<
  typeof zToDiskMoveCatalogNodeResponse
>;
