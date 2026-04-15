import { z } from 'zod';
import { zBaseConnection } from '#common/zod/backend/base-connection';
import { zExtraSchema } from '#common/zod/backend/connection-schemas/extra-schema';
import { zEv } from '#common/zod/backend/ev';
import { zMproveConfig } from '#common/zod/backend/mprove-config';
import { zBmlError } from '#common/zod/blockml/bml-error';
import { zBmlFile } from '#common/zod/blockml/bml-file';
import { zChart } from '#common/zod/blockml/chart';
import { zDashboard } from '#common/zod/blockml/dashboard';
import { zMconfig } from '#common/zod/blockml/mconfig';
import { zModel } from '#common/zod/blockml/model';
import { zModelMetric } from '#common/zod/blockml/model-metric';
import { zPreset } from '#common/zod/blockml/preset';
import { zQuery } from '#common/zod/blockml/query';
import { zReport } from '#common/zod/blockml/report';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToBlockmlRequest } from '#common/zod/to-blockml/to-blockml-request';

export let zToBlockmlRebuildStructRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evs: z.array(zEv),
    structId: z.string(),
    mproveDir: z.string().nullish(),
    files: z.array(zBmlFile),
    baseConnections: z.array(zBaseConnection),
    overrideTimezone: z.string().nullish(),
    isUseCache: z.boolean(),
    cachedMproveConfig: zMproveConfig.nullish(),
    cachedModels: z.array(zModel),
    cachedMetrics: z.array(zModelMetric)
  })
  .meta({ id: 'ToBlockmlRebuildStructRequestPayload' });

export let zToBlockmlRebuildStructRequest = zToBlockmlRequest
  .extend({
    payload: zToBlockmlRebuildStructRequestPayload
  })
  .meta({ id: 'ToBlockmlRebuildStructRequest' });

export let zToBlockmlRebuildStructResponsePayload = z
  .object({
    extraSchemas: z.array(zExtraSchema),
    mproveConfig: zMproveConfig,
    errors: z.array(zBmlError),
    models: z.array(zModel),
    dashboards: z.array(zDashboard),
    reports: z.array(zReport),
    charts: z.array(zChart),
    metrics: z.array(zModelMetric),
    presets: z.array(zPreset),
    mconfigs: z.array(zMconfig),
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBlockmlRebuildStructResponsePayload' });

export let zToBlockmlRebuildStructResponse = zMyResponse
  .extend({
    payload: zToBlockmlRebuildStructResponsePayload
  })
  .meta({ id: 'ToBlockmlRebuildStructResponse' });

export type ToBlockmlRebuildStructRequestPayload = z.infer<
  typeof zToBlockmlRebuildStructRequestPayload
>;
export type ToBlockmlRebuildStructRequest = z.infer<
  typeof zToBlockmlRebuildStructRequest
>;
export type ToBlockmlRebuildStructResponsePayload = z.infer<
  typeof zToBlockmlRebuildStructResponsePayload
>;
export type ToBlockmlRebuildStructResponse = z.infer<
  typeof zToBlockmlRebuildStructResponse
>;
