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
  type ToDiskSaveFileError,
  zToDiskSaveFileError
} from './save-file-error';

export type ToDiskSaveFileOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskSaveFileResponse = ToDiskResponse<
  'ToDiskSaveFile',
  ToDiskSaveFileOutput,
  ToDiskSaveFileError
>;

export let zToDiskSaveFileResponse = makeToDiskResponseSchema({
  path: 'ToDiskSaveFile',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskSaveFileOutput' }),
  error: zToDiskSaveFileError
});

assertTypesEqual<
  ToDiskSaveFileResponse,
  z.infer<typeof zToDiskSaveFileResponse>
>({ value: true });
