import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/types/disk/repo';

export type ToDiskSaveFileOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskSaveFileOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskSaveFileOutput' });

assertTypesEqual<ToDiskSaveFileOutput, z.infer<typeof zToDiskSaveFileOutput>>({
  value: true
});
