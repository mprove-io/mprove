import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetModelsRequest = {
  operation: 'getModels';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    filterByModelIds?: string[];
  };
};

export let zToBackendGetModelsRequest = z
  .strictObject({
    operation: z.literal('getModels'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        filterByModelIds: z.array(z.string()).nullish()
      })
      .meta({ id: 'ToBackendGetModelsInput' })
  })
  .meta({ id: 'ToBackendGetModelsRequest' });

assertTypesEqual<
  ToBackendGetModelsRequest,
  z.infer<typeof zToBackendGetModelsRequest>
>({ value: true });
