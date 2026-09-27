import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetBranchesListInput = {
  projectId: string;
};

export type ToBackendGetBranchesListRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetBranchesListInput;
};

export let zToBackendGetBranchesListInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetBranchesListInput' });

export let zToBackendGetBranchesListRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetBranchesListInput
  })
  .meta({ id: 'ToBackendGetBranchesListRequest' });

assertTypesEqual<
  ToBackendGetBranchesListInput,
  z.infer<typeof zToBackendGetBranchesListInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetBranchesListRequest,
  z.infer<typeof zToBackendGetBranchesListRequest>
>({ value: true });
