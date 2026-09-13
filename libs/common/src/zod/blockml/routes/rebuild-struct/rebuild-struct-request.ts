import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseConnection } from '#common/zod/backend/base-connection';
import { zBaseConnection } from '#common/zod/backend/base-connection';
import type { Ev } from '#common/zod/backend/ev';
import { zEv } from '#common/zod/backend/ev';
import type { MproveConfig } from '#common/zod/backend/mprove-config';
import { zMproveConfig } from '#common/zod/backend/mprove-config';
import type { SelectedGiven } from '#common/zod/backend/selected-given';
import { zSelectedGiven } from '#common/zod/backend/selected-given';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import { zBmlFile } from '#common/zod/blockml/bml-file';
import type { Model } from '#common/zod/blockml/model';
import { zModel } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import { zModelMetric } from '#common/zod/blockml/model-metric';

export type ToBlockmlRebuildStructRequest = {
  operation: 'rebuildStruct';
  traceId: string;
  input: {
    projectId: string;
    envId: string;
    evs: Ev[];
    structId: string;
    mproveDir?: string;
    files: BmlFile[];
    baseConnections: BaseConnection[];
    selectedGivens: SelectedGiven[];
    overrideTimezone?: string;
    isUseCache: boolean;
    cachedMproveConfig?: MproveConfig;
    cachedModels: Model[];
    cachedMetrics: ModelMetric[];
  };
};

export let zToBlockmlRebuildStructRequest = z
  .strictObject({
    operation: z.literal('rebuildStruct'),
    traceId: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        evs: z.array(zEv),
        structId: z.string(),
        mproveDir: z.string().nullish(),
        files: z.array(zBmlFile),
        baseConnections: z.array(zBaseConnection),
        selectedGivens: z.array(zSelectedGiven),
        overrideTimezone: z.string().nullish(),
        isUseCache: z.boolean(),
        cachedMproveConfig: zMproveConfig.nullish(),
        cachedModels: z.array(zModel),
        cachedMetrics: z.array(zModelMetric)
      })
      .meta({ id: 'ToBlockmlRebuildStructRequestInput' })
  })
  .meta({ id: 'ToBlockmlRebuildStructRequest' });

assertTypesEqual<
  ToBlockmlRebuildStructRequest,
  z.infer<typeof zToBlockmlRebuildStructRequest>
>({ value: true });
