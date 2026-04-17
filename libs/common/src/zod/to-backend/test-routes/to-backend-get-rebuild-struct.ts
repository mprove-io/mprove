import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMproveConfig } from '#common/zod/backend/mprove-config';
import { zModel } from '#common/zod/blockml/model';
import { zModelMetric } from '#common/zod/blockml/model-metric';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';
import { zToBlockmlRebuildStructResponsePayload } from '#common/zod/to-blockml/api/to-blockml-rebuild-struct';

export let zToBackendGetRebuildStructRequestPayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    branch: z.string(),
    envId: z.string(),
    overrideTimezone: z.string().nullish(),
    isUseCache: z.boolean(),
    cachedMproveConfig: zMproveConfig.nullish(),
    cachedModels: z.array(zModel),
    cachedMetrics: z.array(zModelMetric)
  })
  .meta({ id: 'ToBackendGetRebuildStructRequestPayload' });

export let zToBackendGetRebuildStructRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct)
  })
  .meta({ id: 'ToBackendGetRebuildStructRequestInfo' });

export let zToBackendGetRebuildStructRequest = zToBackendRequest
  .extend({
    info: zToBackendGetRebuildStructRequestInfo,
    payload: zToBackendGetRebuildStructRequestPayload
  })
  .meta({ id: 'ToBackendGetRebuildStructRequest' });

export let zToBackendGetRebuildStructResponsePayload =
  zToBlockmlRebuildStructResponsePayload;

export let zToBackendGetRebuildStructResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetRebuildStructResponseInfo' });

export let zToBackendGetRebuildStructResponse = zMyResponse
  .extend({
    info: zToBackendGetRebuildStructResponseInfo,
    payload: zToBackendGetRebuildStructResponsePayload
  })
  .meta({ id: 'ToBackendGetRebuildStructResponse' });

export type ToBackendGetRebuildStructRequestPayload = z.infer<
  typeof zToBackendGetRebuildStructRequestPayload
>;
export type ToBackendGetRebuildStructRequest = z.infer<
  typeof zToBackendGetRebuildStructRequest
>;
export type ToBackendGetRebuildStructResponsePayload = z.infer<
  typeof zToBackendGetRebuildStructResponsePayload
>;
export type ToBackendGetRebuildStructResponse = z.infer<
  typeof zToBackendGetRebuildStructResponse
>;
