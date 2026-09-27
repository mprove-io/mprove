import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskDeleteDevRepoOutput = {
  orgId: string;
  projectId: string;
  deletedRepoId: string;
};

export let zToDiskDeleteDevRepoOutput = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    deletedRepoId: z.string()
  })
  .meta({ id: 'ToDiskDeleteDevRepoOutput' });

assertTypesEqual<
  ToDiskDeleteDevRepoOutput,
  z.infer<typeof zToDiskDeleteDevRepoOutput>
>({ value: true });
