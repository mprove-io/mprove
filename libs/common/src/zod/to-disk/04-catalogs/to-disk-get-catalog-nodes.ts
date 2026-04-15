import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskGetCatalogNodesRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string().nullish(),
    isFetch: z.boolean()
  })
  .meta({ id: 'ToDiskGetCatalogNodesRequestPayload' });

export let zToDiskGetCatalogNodesRequest = zToDiskRequest
  .extend({
    payload: zToDiskGetCatalogNodesRequestPayload
  })
  .meta({ id: 'ToDiskGetCatalogNodesRequest' });

export let zToDiskGetCatalogNodesResponsePayload = z
  .object({
    repo: zRepo
  })
  .meta({ id: 'ToDiskGetCatalogNodesResponsePayload' });

export let zToDiskGetCatalogNodesResponse = zMyResponse
  .extend({
    payload: zToDiskGetCatalogNodesResponsePayload
  })
  .meta({ id: 'ToDiskGetCatalogNodesResponse' });

export type ToDiskGetCatalogNodesRequestPayload = z.infer<
  typeof zToDiskGetCatalogNodesRequestPayload
>;
export type ToDiskGetCatalogNodesRequest = z.infer<
  typeof zToDiskGetCatalogNodesRequest
>;
export type ToDiskGetCatalogNodesResponsePayload = z.infer<
  typeof zToDiskGetCatalogNodesResponsePayload
>;
export type ToDiskGetCatalogNodesResponse = z.infer<
  typeof zToDiskGetCatalogNodesResponse
>;
