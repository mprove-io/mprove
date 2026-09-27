import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveConfig,
  zMproveConfig
} from '#common/zod/backend/mprove-config';
import { type Model, zModel } from '#common/zod/blockml/model';
import {
  type ModelMetric,
  zModelMetric
} from '#common/zod/blockml/model-metric';

export type ToBackendGetRebuildStructInput = {
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

export type ToBackendGetRebuildStructRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetRebuildStructInput;
};

export let zToBackendGetRebuildStructInput = z
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
  .meta({ id: 'ToBackendGetRebuildStructInput' });

export let zToBackendGetRebuildStructRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetRebuildStructInput
  })
  .meta({ id: 'ToBackendGetRebuildStructRequest' });

assertTypesEqual<
  ToBackendGetRebuildStructInput,
  z.infer<typeof zToBackendGetRebuildStructInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetRebuildStructRequest,
  z.infer<typeof zToBackendGetRebuildStructRequest>
>({ value: true });
