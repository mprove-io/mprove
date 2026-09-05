import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { Repo } from '#common/zod/disk/repo';
import { zRepo } from '#common/zod/disk/repo';

export type ToDiskPushRepoResponsePayload = {
  repo: Repo;
  productionFiles: DiskCatalogFile[];
  productionMproveDir: string;
};

export let zToDiskPushRepoResponsePayload = z
  .object({
    repo: zRepo,
    productionFiles: z.array(zDiskCatalogFile),
    productionMproveDir: z.string()
  })
  .meta({ id: 'ToDiskPushRepoResponsePayload' });

assertTypesEqual<
  ToDiskPushRepoResponsePayload,
  z.infer<typeof zToDiskPushRepoResponsePayload>
>({ value: true });
