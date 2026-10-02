import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSuggestDimensionValuesRequest = {
  operation: 'suggestDimensionValues';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    structId: string;
    modelId: string;
    fieldId: string;
    chartId?: string;
    dashboardId?: string;
    reportId?: string;
    rowId?: string;
    term?: string;
    cellMetricsStartDateMs?: number;
    cellMetricsEndDateMs?: number;
  };
};

export let zToBackendSuggestDimensionValuesRequest = z
  .strictObject({
    operation: z.literal('suggestDimensionValues'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        structId: z.string(),
        modelId: z.string(),
        fieldId: z.string(),
        chartId: z.string().nullish(),
        dashboardId: z.string().nullish(),
        reportId: z.string().nullish(),
        rowId: z.string().nullish(),
        term: z.string().nullish(),
        cellMetricsStartDateMs: z.number().nullish(),
        cellMetricsEndDateMs: z.number().nullish()
      })
      .meta({ id: 'ToBackendSuggestDimensionValuesInput' })
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesRequest' });

assertTypesEqual<
  ToBackendSuggestDimensionValuesRequest,
  z.infer<typeof zToBackendSuggestDimensionValuesRequest>
>({ value: true });
