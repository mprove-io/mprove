import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { Repo } from '#common/zod/disk/repo';
import { zRepo } from '#common/zod/disk/repo';

export type ToDiskCreateDevRepoResponsePayload = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
  initialCommitHash?: string;
};

export let zToDiskCreateDevRepoResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string(),
    initialCommitHash: z.string().nullish()
  })
  .meta({ id: 'ToDiskCreateDevRepoResponsePayload' });

assertTypesEqual<
  ToDiskCreateDevRepoResponsePayload,
  z.infer<typeof zToDiskCreateDevRepoResponsePayload>
>({ value: true });
