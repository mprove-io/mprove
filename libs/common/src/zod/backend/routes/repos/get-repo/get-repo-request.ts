import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetRepoInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  isFetch: boolean;
};

export type ToBackendGetRepoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetRepoInput;
};

export let zToBackendGetRepoInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    isFetch: z.boolean()
  })
  .meta({ id: 'ToBackendGetRepoInput' });

export let zToBackendGetRepoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetRepoInput
  })
  .meta({ id: 'ToBackendGetRepoRequest' });

assertTypesEqual<ToBackendGetRepoInput, z.infer<typeof zToBackendGetRepoInput>>(
  { value: true }
);

assertTypesEqual<
  ToBackendGetRepoRequest,
  z.infer<typeof zToBackendGetRepoRequest>
>({ value: true });
