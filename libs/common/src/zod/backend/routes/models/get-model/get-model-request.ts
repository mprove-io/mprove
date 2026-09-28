import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetModelRequest = {
  operation: 'getModel';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    modelId: string;
    getMalloy: boolean;
  };
};

export let zToBackendGetModelRequest = z
  .strictObject({
    operation: z.literal('getModel'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        modelId: z.string(),
        getMalloy: z.boolean()
      })
      .meta({ id: 'ToBackendGetModelInput' })
  })
  .meta({ id: 'ToBackendGetModelRequest' });

assertTypesEqual<
  ToBackendGetModelRequest,
  z.infer<typeof zToBackendGetModelRequest>
>({ value: true });
