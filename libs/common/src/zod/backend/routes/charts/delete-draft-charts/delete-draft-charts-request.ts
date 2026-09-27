import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDraftChartsInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  chartIds: string[];
};

export type ToBackendDeleteDraftChartsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteDraftChartsInput;
};

export let zToBackendDeleteDraftChartsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendDeleteDraftChartsInput' });

export let zToBackendDeleteDraftChartsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteDraftChartsInput
  })
  .meta({ id: 'ToBackendDeleteDraftChartsRequest' });

assertTypesEqual<
  ToBackendDeleteDraftChartsInput,
  z.infer<typeof zToBackendDeleteDraftChartsInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDraftChartsRequest,
  z.infer<typeof zToBackendDeleteDraftChartsRequest>
>({ value: true });
