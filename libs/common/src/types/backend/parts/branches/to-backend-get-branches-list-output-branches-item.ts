import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import { zRepoType } from '#common/types/disk/parts/repo/repo-type';

export type ToBackendGetBranchesListOutputBranchesItem = {
  repoId: string;
  repoType: RepoType;
  branchId: string;
};

export let zToBackendGetBranchesListOutputBranchesItem = z
  .object({
    repoId: z.string(),
    repoType: zRepoType,
    branchId: z.string()
  })
  .meta({ id: 'ToBackendGetBranchesListOutputBranchesItem' });

assertTypesEqual<
  ToBackendGetBranchesListOutputBranchesItem,
  z.infer<typeof zToBackendGetBranchesListOutputBranchesItem>
>({ value: true });
