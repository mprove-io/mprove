import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';

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
