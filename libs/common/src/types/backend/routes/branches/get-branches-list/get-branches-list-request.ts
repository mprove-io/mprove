import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetBranchesListRequest = {
  operation: 'getBranchesList';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetBranchesListRequest = z
  .strictObject({
    operation: z.literal('getBranchesList'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendGetBranchesListInput' })
  })
  .meta({ id: 'ToBackendGetBranchesListRequest' });

assertTypesEqual<
  ToBackendGetBranchesListRequest,
  z.infer<typeof zToBackendGetBranchesListRequest>
>({ value: true });
