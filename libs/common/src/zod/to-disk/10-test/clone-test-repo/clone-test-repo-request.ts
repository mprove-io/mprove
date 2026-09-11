import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskCloneTestRepoRequest = {
  operation: 'cloneTestRepo';
  traceId: string;
  input: {
    testId: string;
  };
};

export let zToDiskCloneTestRepoRequest = z
  .strictObject({
    operation: z.literal('cloneTestRepo'),
    traceId: z.string(),
    input: z
      .object({
        testId: z.string()
      })
      .meta({ id: 'ToDiskCloneTestRepoRequestInput' })
  })
  .meta({ id: 'ToDiskCloneTestRepoRequest' });

assertTypesEqual<
  ToDiskCloneTestRepoRequest,
  z.infer<typeof zToDiskCloneTestRepoRequest>
>({ value: true });
