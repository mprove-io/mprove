import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteProjectRequest = {
  operation: 'deleteProject';
  traceId: string;
  input: {
    orgId: string;
    projectId: string;
  };
};

export let zToDiskDeleteProjectRequest = z
  .strictObject({
    operation: z.literal('deleteProject'),
    traceId: z.string(),
    input: z
      .object({
        orgId: z.string(),
        projectId: z.string()
      })
      .meta({ id: 'ToDiskDeleteProjectRequestInput' })
  })
  .meta({ id: 'ToDiskDeleteProjectRequest' });

assertTypesEqual<
  ToDiskDeleteProjectRequest,
  z.infer<typeof zToDiskDeleteProjectRequest>
>({ value: true });
