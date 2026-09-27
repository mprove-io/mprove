import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCancelQueriesInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  mconfigIds: string[];
};

export type ToBackendCancelQueriesRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCancelQueriesInput;
};

export let zToBackendCancelQueriesInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string()).min(1)
  })
  .meta({ id: 'ToBackendCancelQueriesInput' });

export let zToBackendCancelQueriesRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCancelQueriesInput
  })
  .meta({ id: 'ToBackendCancelQueriesRequest' });

assertTypesEqual<
  ToBackendCancelQueriesInput,
  z.infer<typeof zToBackendCancelQueriesInput>
>({ value: true });

assertTypesEqual<
  ToBackendCancelQueriesRequest,
  z.infer<typeof zToBackendCancelQueriesRequest>
>({ value: true });
