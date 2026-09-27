import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRunQueriesInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  mconfigIds: string[];
  poolSize?: number;
};

export type ToBackendRunQueriesRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRunQueriesInput;
};

export let zToBackendRunQueriesInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string()).min(1),
    poolSize: z.number().int().positive().nullish()
  })
  .meta({ id: 'ToBackendRunQueriesInput' });

export let zToBackendRunQueriesRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRunQueriesInput
  })
  .meta({ id: 'ToBackendRunQueriesRequest' });

assertTypesEqual<
  ToBackendRunQueriesInput,
  z.infer<typeof zToBackendRunQueriesInput>
>({ value: true });

assertTypesEqual<
  ToBackendRunQueriesRequest,
  z.infer<typeof zToBackendRunQueriesRequest>
>({ value: true });
