import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/parts/disk-catalog-file';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

export type ToDiskPushRepoOutput = {
  repo: Repo;
  productionFiles: DiskCatalogFile[];
  productionMproveDir: string;
};

export let zToDiskPushRepoOutput = z
  .object({
    repo: zRepo,
    productionFiles: z.array(zDiskCatalogFile),
    productionMproveDir: z.string()
  })
  .meta({ id: 'ToDiskPushRepoOutput' });

assertTypesEqual<ToDiskPushRepoOutput, z.infer<typeof zToDiskPushRepoOutput>>({
  value: true
});
