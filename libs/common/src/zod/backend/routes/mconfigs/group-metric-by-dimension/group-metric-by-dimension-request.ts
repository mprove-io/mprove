import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendGroupMetricByDimensionInput = {
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

export type ToBackendGroupMetricByDimensionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGroupMetricByDimensionInput;
};

export let zToBackendGroupMetricByDimensionInput = z
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
  .meta({ id: 'ToBackendGroupMetricByDimensionInput' });

export let zToBackendGroupMetricByDimensionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGroupMetricByDimensionInput
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionRequest' });

assertTypesEqual<
  ToBackendGroupMetricByDimensionInput,
  z.infer<typeof zToBackendGroupMetricByDimensionInput>
>({ value: true });

assertTypesEqual<
  ToBackendGroupMetricByDimensionRequest,
  z.infer<typeof zToBackendGroupMetricByDimensionRequest>
>({ value: true });
