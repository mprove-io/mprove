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
  type ToDiskCreateFolderError,
  zToDiskCreateFolderError
} from './create-folder-error';

export type ToDiskCreateFolderOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskCreateFolderResponse = ToDiskResponse<
  'createFolder',
  ToDiskCreateFolderOutput,
  ToDiskCreateFolderError
>;

export let zToDiskCreateFolderResponse = makeToDiskResponseSchema({
  operation: 'createFolder',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskCreateFolderOutput' }),
  error: zToDiskCreateFolderError
});

assertTypesEqual<
  ToDiskCreateFolderResponse,
  z.infer<typeof zToDiskCreateFolderResponse>
>({ value: true });
