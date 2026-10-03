import type { RepoTypeEnum } from '#common/enums/repo-type.enum';
import type { EnumValues } from '#common/types/enum-values';

export type BranchItem = {
  repoId: string;
  repoType: EnumValues<typeof RepoTypeEnum>;
  branchId: string;
  extraId: string;
  extraName: string;
};
