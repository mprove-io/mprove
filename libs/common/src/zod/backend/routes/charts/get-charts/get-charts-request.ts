import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetChartsInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendGetChartsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetChartsInput;
};

export let zToBackendGetChartsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetChartsInput' });

export let zToBackendGetChartsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetChartsInput
  })
  .meta({ id: 'ToBackendGetChartsRequest' });

assertTypesEqual<
  ToBackendGetChartsInput,
  z.infer<typeof zToBackendGetChartsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetChartsRequest,
  z.infer<typeof zToBackendGetChartsRequest>
>({ value: true });
