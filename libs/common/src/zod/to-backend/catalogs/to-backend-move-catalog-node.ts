import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendMoveCatalogNodeRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromNodeId: z.string(),
    toNodeId: z.string()
  })
  .meta({ id: 'ToBackendMoveCatalogNodeRequestPayload' });

export let zToBackendMoveCatalogNodeRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode)
  })
  .meta({ id: 'ToBackendMoveCatalogNodeRequestInfo' });

export let zToBackendMoveCatalogNodeRequest = zToBackendRequest
  .extend({
    info: zToBackendMoveCatalogNodeRequestInfo,
    payload: zToBackendMoveCatalogNodeRequestPayload
  })
  .meta({ id: 'ToBackendMoveCatalogNodeRequest' });

export let zToBackendMoveCatalogNodeResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendMoveCatalogNodeResponsePayload' });

export let zToBackendMoveCatalogNodeResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendMoveCatalogNodeResponseInfo' });

export let zToBackendMoveCatalogNodeResponse = zMyResponse
  .extend({
    info: zToBackendMoveCatalogNodeResponseInfo,
    payload: zToBackendMoveCatalogNodeResponsePayload
  })
  .meta({ id: 'ToBackendMoveCatalogNodeResponse' });

export type ToBackendMoveCatalogNodeRequestPayload = z.infer<
  typeof zToBackendMoveCatalogNodeRequestPayload
>;
export type ToBackendMoveCatalogNodeRequest = z.infer<
  typeof zToBackendMoveCatalogNodeRequest
>;
export type ToBackendMoveCatalogNodeResponsePayload = z.infer<
  typeof zToBackendMoveCatalogNodeResponsePayload
>;
export type ToBackendMoveCatalogNodeResponse = z.infer<
  typeof zToBackendMoveCatalogNodeResponse
>;
