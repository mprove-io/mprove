import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zBridgeItem = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    structId: z.string(),
    needValidate: z.boolean(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'BridgeItem' });

export let zToBackendSpecialRebuildStructsRequestPayload = z
  .object({
    specialKey: z.string(),
    userIds: z.array(z.string()),
    skipRebuild: z.boolean(),
    overrideTimezone: z.string().nullish()
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsRequestPayload' });

export let zToBackendSpecialRebuildStructsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSpecialRebuildStructs)
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsRequestInfo' });

export let zToBackendSpecialRebuildStructsRequest = zToBackendRequest
  .extend({
    info: zToBackendSpecialRebuildStructsRequestInfo,
    payload: zToBackendSpecialRebuildStructsRequestPayload
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsRequest' });

export let zToBackendSpecialRebuildStructsResponsePayload = z
  .object({
    notFoundProjectIds: z.array(z.string()),
    successBridgeItems: z.array(zBridgeItem),
    successTotal: z.number(),
    errorGetCatalogBridgeItems: z.array(zBridgeItem),
    errorTotal: z.number()
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsResponsePayload' });

export let zToBackendSpecialRebuildStructsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSpecialRebuildStructs}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsResponseInfo' });

export let zToBackendSpecialRebuildStructsResponse = zMyResponse
  .extend({
    info: zToBackendSpecialRebuildStructsResponseInfo,
    payload: zToBackendSpecialRebuildStructsResponsePayload
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsResponse' });

export type BridgeItem = z.infer<typeof zBridgeItem>;
export type ToBackendSpecialRebuildStructsRequestPayload = z.infer<
  typeof zToBackendSpecialRebuildStructsRequestPayload
>;
export type ToBackendSpecialRebuildStructsRequest = z.infer<
  typeof zToBackendSpecialRebuildStructsRequest
>;
export type ToBackendSpecialRebuildStructsResponsePayload = z.infer<
  typeof zToBackendSpecialRebuildStructsResponsePayload
>;
export type ToBackendSpecialRebuildStructsResponse = z.infer<
  typeof zToBackendSpecialRebuildStructsResponse
>;
