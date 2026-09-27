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
  type ToDiskCreateFileError,
  zToDiskCreateFileError
} from './create-file-error';

export type ToDiskCreateFileResponse = ToDiskResponseBase<
  'createFile',
  ToDiskCreateFileOutput,
  ToDiskCreateFileError
>;

export type ToDiskCreateFileOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskCreateFileOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskCreateFileOutput' });

export let zToDiskCreateFileResponse = makeToDiskResponseSchema({
  operation: 'createFile',
  output: zToDiskCreateFileOutput,
  error: zToDiskCreateFileError
});

assertTypesEqual<
  ToDiskCreateFileOutput,
  z.infer<typeof zToDiskCreateFileOutput>
>({ value: true });

assertTypesEqual<
  ToDiskCreateFileResponse,
  z.infer<typeof zToDiskCreateFileResponse>
>({ value: true });
