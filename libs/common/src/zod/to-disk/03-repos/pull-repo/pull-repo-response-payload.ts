import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { Repo } from '#common/zod/disk/repo';
import { zRepo } from '#common/zod/disk/repo';

export type ToDiskPullRepoResponsePayload = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskPullRepoResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskPullRepoResponsePayload' });

assertTypesEqual<
  ToDiskPullRepoResponsePayload,
  z.infer<typeof zToDiskPullRepoResponsePayload>
>({ value: true });
