import { z } from 'zod';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';

export let zBranchItem = z
  .object({
    repoId: z.string(),
    repoType: z.enum(RepoTypeEnum),
    branchId: z.string(),
    extraId: z.string(),
    extraName: z.string()
  })
  .meta({ id: 'BranchItem' });

export type BranchItem = z.infer<typeof zBranchItem>;
