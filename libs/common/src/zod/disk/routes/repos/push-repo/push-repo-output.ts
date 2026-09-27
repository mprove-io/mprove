import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';

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
