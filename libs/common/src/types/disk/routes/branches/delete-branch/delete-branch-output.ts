import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/types/disk/repo';

export type ToDiskDeleteBranchOutput = {
  repo: Repo;
  deletedBranch: string;
};

export let zToDiskDeleteBranchOutput = z
  .object({ repo: zRepo, deletedBranch: z.string() })
  .meta({ id: 'ToDiskDeleteBranchOutput' });

assertTypesEqual<
  ToDiskDeleteBranchOutput,
  z.infer<typeof zToDiskDeleteBranchOutput>
>({ value: true });
