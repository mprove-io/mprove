import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskCloneTestRepoRequestPayload = {
  testId: string;
};

export let zToDiskCloneTestRepoRequestPayload = z
  .object({
    testId: z.string()
  })
  .meta({ id: 'ToDiskCloneTestRepoRequestPayload' });

assertTypesEqual<
  ToDiskCloneTestRepoRequestPayload,
  z.infer<typeof zToDiskCloneTestRepoRequestPayload>
>({ value: true });
