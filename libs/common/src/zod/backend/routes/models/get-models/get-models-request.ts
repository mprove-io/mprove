import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetModelsInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  filterByModelIds?: string[];
};

export type ToBackendGetModelsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetModelsInput;
};

export let zToBackendGetModelsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    filterByModelIds: z.array(z.string()).nullish()
  })
  .meta({ id: 'ToBackendGetModelsInput' });

export let zToBackendGetModelsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetModelsInput
  })
  .meta({ id: 'ToBackendGetModelsRequest' });

assertTypesEqual<
  ToBackendGetModelsInput,
  z.infer<typeof zToBackendGetModelsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetModelsRequest,
  z.infer<typeof zToBackendGetModelsRequest>
>({ value: true });
