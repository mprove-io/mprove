import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskDeleteBranchResponsePayload = {
  repo: Repo;
  deletedBranch: string;
};

export let zToDiskDeleteBranchResponsePayload = z
  .object({ repo: zRepo, deletedBranch: z.string() })
  .meta({ id: 'ToDiskDeleteBranchResponsePayload' });

assertTypesEqual<
  ToDiskDeleteBranchResponsePayload,
  z.infer<typeof zToDiskDeleteBranchResponsePayload>
>({ value: true });
