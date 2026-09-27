import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCloneTestRepoInput = {
  testId: string;
};

export type ToBackendCloneTestRepoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCloneTestRepoInput;
};

export let zToBackendCloneTestRepoInput = z
  .object({
    testId: z.string()
  })
  .meta({ id: 'ToBackendCloneTestRepoInput' });

export let zToBackendCloneTestRepoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCloneTestRepoInput
  })
  .meta({ id: 'ToBackendCloneTestRepoRequest' });

assertTypesEqual<
  ToBackendCloneTestRepoInput,
  z.infer<typeof zToBackendCloneTestRepoInput>
>({ value: true });

assertTypesEqual<
  ToBackendCloneTestRepoRequest,
  z.infer<typeof zToBackendCloneTestRepoRequest>
>({ value: true });
