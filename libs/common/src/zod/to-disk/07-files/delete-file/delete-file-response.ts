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
  type ToDiskDeleteFileError,
  zToDiskDeleteFileError
} from './delete-file-error';

export type ToDiskDeleteFileOutput = {
  repo: Repo;
  deletedFileNodeId: string;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskDeleteFileResponse = ToDiskResponse<
  'ToDiskDeleteFile',
  ToDiskDeleteFileOutput,
  ToDiskDeleteFileError
>;

export let zToDiskDeleteFileResponse = makeToDiskResponseSchema({
  path: 'ToDiskDeleteFile',
  success: z
    .object({
      repo: zRepo,
      deletedFileNodeId: z.string(),
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskDeleteFileOutput' }),
  error: zToDiskDeleteFileError
});

assertTypesEqual<
  ToDiskDeleteFileResponse,
  z.infer<typeof zToDiskDeleteFileResponse>
>({ value: true });
