import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/parts/catalog/disk-catalog-file';
import { type Repo, zRepo } from '#common/types/disk/parts/repo/repo';

export type ToDiskDeleteFileOutput = {
  repo: Repo;
  deletedFileNodeId: string;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskDeleteFileOutput = z
  .object({
    repo: zRepo,
    deletedFileNodeId: z.string(),
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskDeleteFileOutput' });

assertTypesEqual<
  ToDiskDeleteFileOutput,
  z.infer<typeof zToDiskDeleteFileOutput>
>({ value: true });
