import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetQueriesInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  mconfigIds: string[];
  skipData: boolean;
};

export type ToBackendGetQueriesRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetQueriesInput;
};

export let zToBackendGetQueriesInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string()).min(1),
    skipData: z.boolean()
  })
  .meta({ id: 'ToBackendGetQueriesInput' });

export let zToBackendGetQueriesRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetQueriesInput
  })
  .meta({ id: 'ToBackendGetQueriesRequest' });

assertTypesEqual<
  ToBackendGetQueriesInput,
  z.infer<typeof zToBackendGetQueriesInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetQueriesRequest,
  z.infer<typeof zToBackendGetQueriesRequest>
>({ value: true });
