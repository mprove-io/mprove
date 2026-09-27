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
  type ToDiskDeleteFileError,
  zToDiskDeleteFileError
} from './delete-file-error';

export type ToDiskDeleteFileResponse = ToDiskResponseBase<
  'deleteFile',
  ToDiskDeleteFileOutput,
  ToDiskDeleteFileError
>;

export type ToDiskDeleteFileOutput = {
  repo: Repo;
  deletedFileNodeId: string;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskDeleteFileOutput = z
  .object({
    repo: zRepo,
    deletedFileNodeId: z.string(),
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskDeleteFileOutput' });

export let zToDiskDeleteFileResponse = makeToDiskResponseSchema({
  operation: 'deleteFile',
  output: zToDiskDeleteFileOutput,
  error: zToDiskDeleteFileError
});

assertTypesEqual<
  ToDiskDeleteFileOutput,
  z.infer<typeof zToDiskDeleteFileOutput>
>({ value: true });

assertTypesEqual<
  ToDiskDeleteFileResponse,
  z.infer<typeof zToDiskDeleteFileResponse>
>({ value: true });
