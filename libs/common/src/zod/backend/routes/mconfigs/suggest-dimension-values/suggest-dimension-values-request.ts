import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSuggestDimensionValuesInput = {
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

export type ToBackendSuggestDimensionValuesRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSuggestDimensionValuesInput;
};

export let zToBackendSuggestDimensionValuesInput = z
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
  .meta({ id: 'ToBackendSuggestDimensionValuesInput' });

export let zToBackendSuggestDimensionValuesRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSuggestDimensionValuesInput
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesRequest' });

assertTypesEqual<
  ToBackendSuggestDimensionValuesInput,
  z.infer<typeof zToBackendSuggestDimensionValuesInput>
>({ value: true });

assertTypesEqual<
  ToBackendSuggestDimensionValuesRequest,
  z.infer<typeof zToBackendSuggestDimensionValuesRequest>
>({ value: true });
