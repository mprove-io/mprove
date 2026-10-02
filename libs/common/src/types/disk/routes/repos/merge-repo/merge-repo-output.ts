import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/parts/disk-catalog-file';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

export type ToDiskMergeRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskMergeRepoOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskMergeRepoOutput' });

assertTypesEqual<ToDiskMergeRepoOutput, z.infer<typeof zToDiskMergeRepoOutput>>(
  { value: true }
);
