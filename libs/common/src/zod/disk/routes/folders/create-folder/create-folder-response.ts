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
  type ToDiskCreateFolderError,
  zToDiskCreateFolderError
} from './create-folder-error';

export type ToDiskCreateFolderResponse = ToDiskResponseBase<
  'createFolder',
  ToDiskCreateFolderOutput,
  ToDiskCreateFolderError
>;

export type ToDiskCreateFolderOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskCreateFolderOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateFolderOutput' });

export let zToDiskCreateFolderResponse = makeToDiskResponseSchema({
  operation: 'createFolder',
  output: zToDiskCreateFolderOutput,
  error: zToDiskCreateFolderError
});

assertTypesEqual<
  ToDiskCreateFolderOutput,
  z.infer<typeof zToDiskCreateFolderOutput>
>({ value: true });

assertTypesEqual<
  ToDiskCreateFolderResponse,
  z.infer<typeof zToDiskCreateFolderResponse>
>({ value: true });
