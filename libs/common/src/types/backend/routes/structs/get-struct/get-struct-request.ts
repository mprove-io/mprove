import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetStructRequest = {
  operation: 'getStruct';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendGetStructRequest = z
  .strictObject({
    operation: z.literal('getStruct'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendGetStructInput' })
  })
  .meta({ id: 'ToBackendGetStructRequest' });

assertTypesEqual<
  ToBackendGetStructRequest,
  z.infer<typeof zToBackendGetStructRequest>
>({ value: true });
