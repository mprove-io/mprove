import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetStructInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendGetStructRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetStructInput;
};

export let zToBackendGetStructInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetStructInput' });

export let zToBackendGetStructRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetStructInput
  })
  .meta({ id: 'ToBackendGetStructRequest' });

assertTypesEqual<
  ToBackendGetStructInput,
  z.infer<typeof zToBackendGetStructInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetStructRequest,
  z.infer<typeof zToBackendGetStructRequest>
>({ value: true });
