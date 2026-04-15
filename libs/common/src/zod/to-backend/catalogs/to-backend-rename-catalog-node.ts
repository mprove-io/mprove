import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRenameCatalogNodeRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    nodeId: z.string(),
    newName: z.string()
  })
  .meta({ id: 'ToBackendRenameCatalogNodeRequestPayload' });

export let zToBackendRenameCatalogNodeRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode)
  })
  .meta({ id: 'ToBackendRenameCatalogNodeRequestInfo' });

export let zToBackendRenameCatalogNodeRequest = zToBackendRequest
  .extend({
    info: zToBackendRenameCatalogNodeRequestInfo,
    payload: zToBackendRenameCatalogNodeRequestPayload
  })
  .meta({ id: 'ToBackendRenameCatalogNodeRequest' });

export let zToBackendRenameCatalogNodeResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendRenameCatalogNodeResponsePayload' });

export let zToBackendRenameCatalogNodeResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRenameCatalogNodeResponseInfo' });

export let zToBackendRenameCatalogNodeResponse = zMyResponse
  .extend({
    info: zToBackendRenameCatalogNodeResponseInfo,
    payload: zToBackendRenameCatalogNodeResponsePayload
  })
  .meta({ id: 'ToBackendRenameCatalogNodeResponse' });

export type ToBackendRenameCatalogNodeRequestPayload = z.infer<
  typeof zToBackendRenameCatalogNodeRequestPayload
>;
export type ToBackendRenameCatalogNodeRequest = z.infer<
  typeof zToBackendRenameCatalogNodeRequest
>;
export type ToBackendRenameCatalogNodeResponsePayload = z.infer<
  typeof zToBackendRenameCatalogNodeResponsePayload
>;
export type ToBackendRenameCatalogNodeResponse = z.infer<
  typeof zToBackendRenameCatalogNodeResponse
>;
