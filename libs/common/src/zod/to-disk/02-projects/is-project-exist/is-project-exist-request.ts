import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsProjectExistRequest = {
  operation: 'isProjectExist';
  traceId: string;
  input: {
    orgId: string;
    projectId: string;
  };
};

export let zToDiskIsProjectExistRequest = z
  .strictObject({
    operation: z.literal('isProjectExist'),
    traceId: z.string(),
    input: z
      .object({ orgId: z.string(), projectId: z.string() })
      .meta({ id: 'ToDiskIsProjectExistRequestInput' })
  })
  .meta({ id: 'ToDiskIsProjectExistRequest' });

assertTypesEqual<
  ToDiskIsProjectExistRequest,
  z.infer<typeof zToDiskIsProjectExistRequest>
>({ value: true });
