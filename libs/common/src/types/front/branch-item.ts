import { z } from 'zod';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type BranchItem = {
  repoId: string;
  repoType: EnumValues<typeof RepoTypeEnum>;
  branchId: string;
  extraId: string;
  extraName: string;
};

export let zBranchItem = z
  .object({
    repoId: z.string(),
    repoType: z.enum(RepoTypeEnum),
    branchId: z.string(),
    extraId: z.string(),
    extraName: z.string()
  })
  .meta({ id: 'BranchItem' });

assertTypesEqual<BranchItem, z.infer<typeof zBranchItem>>({ value: true });
