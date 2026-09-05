import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskCloneTestRepoResponsePayload = Record<string, never>;

export let zToDiskCloneTestRepoResponsePayload = z
  .object({})
  .meta({ id: 'ToDiskCloneTestRepoResponsePayload' });

assertTypesEqual<
  ToDiskCloneTestRepoResponsePayload,
  z.infer<typeof zToDiskCloneTestRepoResponsePayload>
>({ value: true });
