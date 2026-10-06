import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/types/disk/parts/catalog/disk-catalog-file';
import {
  type DiskFileChange,
  zDiskFileChange
} from '#common/types/disk/parts/file/disk-file-change';
import {
  type DiskSyncFile,
  zDiskSyncFile
} from '#common/types/disk/parts/file/disk-sync-file';
import {
  type SyncRepo,
  zSyncRepo
} from '#common/types/disk/parts/repo/sync-repo';

export type ToDiskSyncRepoOutput =
  | {
      direction: 'from-server';
      files: DiskCatalogFile[];
      mproveDir: string;
      devChangesToCommit: DiskFileChange[];
      syncRepo?: SyncRepo;
      changedFiles: DiskSyncFile[];
      deletedFiles: DiskSyncFile[];
    }
  | {
      direction: 'to-server';
      files: DiskCatalogFile[];
      mproveDir: string;
      devChangesToCommit: DiskFileChange[];
      syncRepo?: SyncRepo;
      appliedChangesOnServer: string[];
    };

export let zToDiskSyncRepoOutput = z
  .discriminatedUnion('direction', [
    z.object({
      direction: z.literal('from-server'),
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string(),
      devChangesToCommit: z.array(zDiskFileChange),
      syncRepo: zSyncRepo.nullish(),
      changedFiles: z.array(zDiskSyncFile),
      deletedFiles: z.array(zDiskSyncFile)
    }),
    z.object({
      direction: z.literal('to-server'),
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string(),
      devChangesToCommit: z.array(zDiskFileChange),
      syncRepo: zSyncRepo.nullish(),
      appliedChangesOnServer: z.array(z.string())
    })
  ])
  .meta({ id: 'ToDiskSyncRepoOutput' });

assertTypesEqual<ToDiskSyncRepoOutput, z.infer<typeof zToDiskSyncRepoOutput>>({
  value: true
});
