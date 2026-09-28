import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetProjectRequest = {
  operation: 'getProject';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetProjectRequest = z
  .strictObject({
    operation: z.literal('getProject'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendGetProjectInput' })
  })
  .meta({ id: 'ToBackendGetProjectRequest' });

assertTypesEqual<
  ToBackendGetProjectRequest,
  z.infer<typeof zToBackendGetProjectRequest>
>({ value: true });
