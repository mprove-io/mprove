import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskDeleteFolderOutput = {
  repo: Repo;
  deletedFolderNodeId: string;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskDeleteFolderOutput = z
  .object({
    repo: zRepo,
    deletedFolderNodeId: z.string(),
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskDeleteFolderOutput' });

assertTypesEqual<
  ToDiskDeleteFolderOutput,
  z.infer<typeof zToDiskDeleteFolderOutput>
>({ value: true });
