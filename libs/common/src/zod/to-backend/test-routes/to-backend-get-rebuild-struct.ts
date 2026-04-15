import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMproveConfig } from '#common/zod/backend/mprove-config';
import { zModel } from '#common/zod/blockml/model';
import { zModelMetric } from '#common/zod/blockml/model-metric';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

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

export type ToBackendGetRebuildStructRequestPayload = z.infer<
  typeof zToBackendGetRebuildStructRequestPayload
>;
export type ToBackendGetRebuildStructRequest = z.infer<
  typeof zToBackendGetRebuildStructRequest
>;
