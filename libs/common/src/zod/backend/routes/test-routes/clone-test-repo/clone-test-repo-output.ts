import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCloneTestRepoOutput = Record<string, never>;

export let zToBackendCloneTestRepoOutput = z
  .object({})
  .meta({ id: 'ToBackendCloneTestRepoOutput' });

assertTypesEqual<
  ToBackendCloneTestRepoOutput,
  z.infer<typeof zToBackendCloneTestRepoOutput>
>({ value: true });
