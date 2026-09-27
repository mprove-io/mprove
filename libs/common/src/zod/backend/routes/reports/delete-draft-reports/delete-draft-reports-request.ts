import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDraftReportsInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  reportIds: string[];
};

export type ToBackendDeleteDraftReportsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteDraftReportsInput;
};

export let zToBackendDeleteDraftReportsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    reportIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendDeleteDraftReportsInput' });

export let zToBackendDeleteDraftReportsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteDraftReportsInput
  })
  .meta({ id: 'ToBackendDeleteDraftReportsRequest' });

assertTypesEqual<
  ToBackendDeleteDraftReportsInput,
  z.infer<typeof zToBackendDeleteDraftReportsInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDraftReportsRequest,
  z.infer<typeof zToBackendDeleteDraftReportsRequest>
>({ value: true });
