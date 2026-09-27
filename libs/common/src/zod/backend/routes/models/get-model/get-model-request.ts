import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetModelInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  modelId: string;
  getMalloy: boolean;
};

export type ToBackendGetModelRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetModelInput;
};

export let zToBackendGetModelInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    modelId: z.string(),
    getMalloy: z.boolean()
  })
  .meta({ id: 'ToBackendGetModelInput' });

export let zToBackendGetModelRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetModelInput
  })
  .meta({ id: 'ToBackendGetModelRequest' });

assertTypesEqual<
  ToBackendGetModelInput,
  z.infer<typeof zToBackendGetModelInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetModelRequest,
  z.infer<typeof zToBackendGetModelRequest>
>({ value: true });
