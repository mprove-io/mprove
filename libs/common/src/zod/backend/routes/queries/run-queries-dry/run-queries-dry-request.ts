import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRunQueriesDryInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  mconfigIds: string[];
  dryId: string;
};

export type ToBackendRunQueriesDryRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRunQueriesDryInput;
};

export let zToBackendRunQueriesDryInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string()).min(1),
    dryId: z.string()
  })
  .meta({ id: 'ToBackendRunQueriesDryInput' });

export let zToBackendRunQueriesDryRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRunQueriesDryInput
  })
  .meta({ id: 'ToBackendRunQueriesDryRequest' });

assertTypesEqual<
  ToBackendRunQueriesDryInput,
  z.infer<typeof zToBackendRunQueriesDryInput>
>({ value: true });

assertTypesEqual<
  ToBackendRunQueriesDryRequest,
  z.infer<typeof zToBackendRunQueriesDryRequest>
>({ value: true });
