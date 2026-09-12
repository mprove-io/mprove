import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskDeleteFolderError,
  zToDiskDeleteFolderError
} from './delete-folder-error';

export type ToDiskDeleteFolderOutput = {
  repo: Repo;
  deletedFolderNodeId: string;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskDeleteFolderResponse = ToDiskResponse<
  'deleteFolder',
  ToDiskDeleteFolderOutput,
  ToDiskDeleteFolderError
>;

export let zToDiskDeleteFolderResponse = makeToDiskResponseSchema({
  operation: 'deleteFolder',
  success: z
    .object({
      repo: zRepo,
      deletedFolderNodeId: z.string(),
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskDeleteFolderOutput' }),
  error: zToDiskDeleteFolderError
});

assertTypesEqual<
  ToDiskDeleteFolderResponse,
  z.infer<typeof zToDiskDeleteFolderResponse>
>({ value: true });
