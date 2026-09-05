import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import { zDiskFileChange } from '#common/zod/disk/disk-file-change';
import { type ToDiskSyncRepoRepo, zToDiskSyncRepoRepo } from './sync-repo-repo';

export type ToDiskSyncRepoBaseResponsePayload = {
  files: DiskCatalogFile[];
  mproveDir: string;
  devChangesToCommit: DiskFileChange[];
  repo?: ToDiskSyncRepoRepo;
};

export let zToDiskSyncRepoBaseResponsePayload = z.object({
  files: z.array(zDiskCatalogFile),
  mproveDir: z.string(),
  devChangesToCommit: z.array(zDiskFileChange),
  repo: zToDiskSyncRepoRepo.nullish()
});

assertTypesEqual<
  ToDiskSyncRepoBaseResponsePayload,
  z.infer<typeof zToDiskSyncRepoBaseResponsePayload>
>({ value: true });
