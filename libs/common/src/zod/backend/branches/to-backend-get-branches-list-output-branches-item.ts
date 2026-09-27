import { z } from 'zod';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetBranchesListOutputBranchesItem = {
  repoId: string;
  repoType: RepoTypeEnum.Production | RepoTypeEnum.Dev | RepoTypeEnum.Session;
  branchId: string;
};

export let zToBackendGetBranchesListOutputBranchesItem = z
  .object({
    repoId: z.string(),
    repoType: z.enum(RepoTypeEnum),
    branchId: z.string()
  })
  .meta({ id: 'ToBackendGetBranchesListOutputBranchesItem' });

assertTypesEqual<
  ToBackendGetBranchesListOutputBranchesItem,
  z.infer<typeof zToBackendGetBranchesListOutputBranchesItem>
>({ value: true });
