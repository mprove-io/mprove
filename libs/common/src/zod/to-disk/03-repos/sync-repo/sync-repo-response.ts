import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import {
  type DiskFileChange,
  zDiskFileChange
} from '#common/zod/disk/disk-file-change';
import {
  type DiskSyncFile,
  zDiskSyncFile
} from '#common/zod/disk/disk-sync-file';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskSyncRepoError,
  zToDiskSyncRepoError
} from './sync-repo-error';
import { type ToDiskSyncRepoRepo, zToDiskSyncRepoRepo } from './sync-repo-repo';

export type ToDiskSyncRepoOutput =
  | {
      direction: 'from-server';
      files: DiskCatalogFile[];
      mproveDir: string;
      devChangesToCommit: DiskFileChange[];
      repo?: ToDiskSyncRepoRepo;
      changedFiles: DiskSyncFile[];
      deletedFiles: DiskSyncFile[];
    }
  | {
      direction: 'to-server';
      files: DiskCatalogFile[];
      mproveDir: string;
      devChangesToCommit: DiskFileChange[];
      repo?: ToDiskSyncRepoRepo;
      appliedChangesOnServer: string[];
    };

export type ToDiskSyncRepoResponse = ToDiskResponse<
  'ToDiskSyncRepo',
  ToDiskSyncRepoOutput,
  ToDiskSyncRepoError
>;

export let zToDiskSyncRepoResponse = makeToDiskResponseSchema({
  path: 'ToDiskSyncRepo',
  success: z
    .discriminatedUnion('direction', [
      z.object({
        direction: z.literal('from-server'),
        files: z.array(zDiskCatalogFile),
        mproveDir: z.string(),
        devChangesToCommit: z.array(zDiskFileChange),
        repo: zToDiskSyncRepoRepo.nullish(),
        changedFiles: z.array(zDiskSyncFile),
        deletedFiles: z.array(zDiskSyncFile)
      }),
      z.object({
        direction: z.literal('to-server'),
        files: z.array(zDiskCatalogFile),
        mproveDir: z.string(),
        devChangesToCommit: z.array(zDiskFileChange),
        repo: zToDiskSyncRepoRepo.nullish(),
        appliedChangesOnServer: z.array(z.string())
      })
    ])
    .meta({ id: 'ToDiskSyncRepoOutput' }),
  error: zToDiskSyncRepoError
});

assertTypesEqual<
  ToDiskSyncRepoResponse,
  z.infer<typeof zToDiskSyncRepoResponse>
>({ value: true });
