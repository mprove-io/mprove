import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteFolderError,
  zToDiskDeleteFolderError
} from './delete-folder-error';

export type ToDiskDeleteFolderResponse = ToDiskResponseBase<
  'deleteFolder',
  ToDiskDeleteFolderOutput,
  ToDiskDeleteFolderError
>;

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

export let zToDiskDeleteFolderResponse = makeToDiskResponseSchema({
  operation: 'deleteFolder',
  output: zToDiskDeleteFolderOutput,
  error: zToDiskDeleteFolderError
});

assertTypesEqual<
  ToDiskDeleteFolderOutput,
  z.infer<typeof zToDiskDeleteFolderOutput>
>({ value: true });

assertTypesEqual<
  ToDiskDeleteFolderResponse,
  z.infer<typeof zToDiskDeleteFolderResponse>
>({ value: true });
