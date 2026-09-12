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
  type ToDiskCreateFileError,
  zToDiskCreateFileError
} from './create-file-error';

export type ToDiskCreateFileOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskCreateFileResponse = ToDiskResponse<
  'createFile',
  ToDiskCreateFileOutput,
  ToDiskCreateFileError
>;

export let zToDiskCreateFileResponse = makeToDiskResponseSchema({
  operation: 'createFile',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskCreateFileOutput' }),
  error: zToDiskCreateFileError
});

assertTypesEqual<
  ToDiskCreateFileResponse,
  z.infer<typeof zToDiskCreateFileResponse>
>({ value: true });
