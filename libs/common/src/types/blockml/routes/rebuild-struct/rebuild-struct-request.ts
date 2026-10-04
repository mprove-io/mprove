import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { BaseConnection } from '#common/types/backend/parts/base-connection';
import { zBaseConnection } from '#common/types/backend/parts/base-connection';
import type { Ev } from '#common/types/backend/parts/ev';
import { zEv } from '#common/types/backend/parts/ev';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import { zSelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { MproveConfig } from '#common/types/backend/parts/mprove-config';
import { zMproveConfig } from '#common/types/backend/parts/mprove-config';
import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';
import { zBmlFile } from '#common/types/blockml/parts/file/bml-file';
import type { Model } from '#common/types/blockml/parts/model/model';
import { zModel } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import { zModelMetric } from '#common/types/blockml/parts/model/model-metric';

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
