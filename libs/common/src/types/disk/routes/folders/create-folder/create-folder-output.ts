import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/parts/catalog/disk-catalog-file';
import { type Repo, zRepo } from '#common/types/disk/parts/repo/repo';

export type ToDiskCreateFolderOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskCreateFolderOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateFolderOutput' });

assertTypesEqual<
  ToDiskCreateFolderOutput,
  z.infer<typeof zToDiskCreateFolderOutput>
>({ value: true });
