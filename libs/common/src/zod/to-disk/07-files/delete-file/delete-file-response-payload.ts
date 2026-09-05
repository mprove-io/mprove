import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { Repo } from '#common/zod/disk/repo';
import { zRepo } from '#common/zod/disk/repo';

export type ToDiskDeleteFileResponsePayload = {
  repo: Repo;
  deletedFileNodeId: string;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskDeleteFileResponsePayload = z
  .object({
    repo: zRepo,
    deletedFileNodeId: z.string(),
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskDeleteFileResponsePayload' });

assertTypesEqual<
  ToDiskDeleteFileResponsePayload,
  z.infer<typeof zToDiskDeleteFileResponsePayload>
>({ value: true });
