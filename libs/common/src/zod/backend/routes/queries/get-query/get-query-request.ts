import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetQueryInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  mconfigId: string;
  queryId: string;
};

export type ToBackendGetQueryRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetQueryInput;
};

export let zToBackendGetQueryInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigId: z.string(),
    queryId: z.string()
  })
  .meta({ id: 'ToBackendGetQueryInput' });

export let zToBackendGetQueryRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetQueryInput
  })
  .meta({ id: 'ToBackendGetQueryRequest' });

assertTypesEqual<
  ToBackendGetQueryInput,
  z.infer<typeof zToBackendGetQueryInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetQueryRequest,
  z.infer<typeof zToBackendGetQueryRequest>
>({ value: true });
