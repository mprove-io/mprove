import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/types/z-timezone';

export type ToBackendGroupMetricByDimensionRequest = {
  operation: 'groupMetricByDimension';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    timezone: string;
    mconfigId: string;
    groupByFieldId: string;
    cellMetricsStartDateMs?: number;
    cellMetricsEndDateMs?: number;
  };
};

export let zToBackendGroupMetricByDimensionRequest = z
  .strictObject({
    operation: z.literal('groupMetricByDimension'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        timezone: zTimezone,
        mconfigId: z.string(),
        groupByFieldId: z.string(),
        cellMetricsStartDateMs: z.number().nullish(),
        cellMetricsEndDateMs: z.number().nullish()
      })
      .meta({ id: 'ToBackendGroupMetricByDimensionInput' })
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionRequest' });

assertTypesEqual<
  ToBackendGroupMetricByDimensionRequest,
  z.infer<typeof zToBackendGroupMetricByDimensionRequest>
>({ value: true });
