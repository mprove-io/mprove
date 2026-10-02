import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCloneTestRepoRequest = {
  operation: 'cloneTestRepo';
  traceId: string;
  idempotencyKey: string;
  input: {
    testId: string;
  };
};

export let zToBackendCloneTestRepoRequest = z
  .strictObject({
    operation: z.literal('cloneTestRepo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        testId: z.string()
      })
      .meta({ id: 'ToBackendCloneTestRepoInput' })
  })
  .meta({ id: 'ToBackendCloneTestRepoRequest' });

assertTypesEqual<
  ToBackendCloneTestRepoRequest,
  z.infer<typeof zToBackendCloneTestRepoRequest>
>({ value: true });
