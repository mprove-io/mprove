import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskCloneTestRepoOutput = Record<string, never>;

export let zToDiskCloneTestRepoOutput = z
  .object({})
  .meta({ id: 'ToDiskCloneTestRepoOutput' });

assertTypesEqual<
  ToDiskCloneTestRepoOutput,
  z.infer<typeof zToDiskCloneTestRepoOutput>
>({ value: true });
