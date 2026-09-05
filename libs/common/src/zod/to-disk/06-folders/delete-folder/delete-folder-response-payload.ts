import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { Repo } from '#common/zod/disk/repo';
import { zRepo } from '#common/zod/disk/repo';

export type ToDiskDeleteFolderResponsePayload = {
  repo: Repo;
  deletedFolderNodeId: string;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskDeleteFolderResponsePayload = z
  .object({
    repo: zRepo,
    deletedFolderNodeId: z.string(),
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskDeleteFolderResponsePayload' });

assertTypesEqual<
  ToDiskDeleteFolderResponsePayload,
  z.infer<typeof zToDiskDeleteFolderResponsePayload>
>({ value: true });
