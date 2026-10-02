import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveConfig,
  zMproveConfig
} from '#common/types/backend/parts/mprove-config';
import { type Model, zModel } from '#common/types/blockml/parts/model';
import {
  type ModelMetric,
  zModelMetric
} from '#common/types/blockml/parts/model-metric';

export type ToBackendGetRebuildStructRequest = {
  operation: 'getRebuildStruct';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
    projectId: string;
    repoId: string;
    branch: string;
    envId: string;
    overrideTimezone?: string;
    isUseCache: boolean;
    cachedMproveConfig?: MproveConfig;
    cachedModels: Model[];
    cachedMetrics: ModelMetric[];
  };
};

export let zToBackendGetRebuildStructRequest = z
  .strictObject({
    operation: z.literal('getRebuildStruct'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendGetRebuildStructInput' })
  })
  .meta({ id: 'ToBackendGetRebuildStructRequest' });

assertTypesEqual<
  ToBackendGetRebuildStructRequest,
  z.infer<typeof zToBackendGetRebuildStructRequest>
>({ value: true });
