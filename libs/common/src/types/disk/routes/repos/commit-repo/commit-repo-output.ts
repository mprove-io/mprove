import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/types/disk/parts/repo/repo';

export type ToDiskCommitRepoOutput = { repo: Repo };

export let zToDiskCommitRepoOutput = z
  .object({ repo: zRepo })
  .meta({ id: 'ToDiskCommitRepoOutput' });

assertTypesEqual<
  ToDiskCommitRepoOutput,
  z.infer<typeof zToDiskCommitRepoOutput>
>({ value: true });
