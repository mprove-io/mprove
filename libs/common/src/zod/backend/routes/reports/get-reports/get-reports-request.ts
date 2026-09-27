import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetReportsInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendGetReportsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetReportsInput;
};

export let zToBackendGetReportsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetReportsInput' });

export let zToBackendGetReportsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetReportsInput
  })
  .meta({ id: 'ToBackendGetReportsRequest' });

assertTypesEqual<
  ToBackendGetReportsInput,
  z.infer<typeof zToBackendGetReportsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetReportsRequest,
  z.infer<typeof zToBackendGetReportsRequest>
>({ value: true });
