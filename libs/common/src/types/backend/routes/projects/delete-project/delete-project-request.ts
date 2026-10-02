import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteProjectRequest = {
  operation: 'deleteProject';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendDeleteProjectRequest = z
  .strictObject({
    operation: z.literal('deleteProject'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendDeleteProjectInput' })
  })
  .meta({ id: 'ToBackendDeleteProjectRequest' });

assertTypesEqual<
  ToBackendDeleteProjectRequest,
  z.infer<typeof zToBackendDeleteProjectRequest>
>({ value: true });
