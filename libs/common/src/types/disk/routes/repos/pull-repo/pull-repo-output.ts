import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/types/disk/repo';

export type ToDiskPullRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskPullRepoOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskPullRepoOutput' });

assertTypesEqual<ToDiskPullRepoOutput, z.infer<typeof zToDiskPullRepoOutput>>({
  value: true
});
