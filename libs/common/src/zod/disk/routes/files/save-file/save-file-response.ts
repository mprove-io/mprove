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
  type ToDiskSaveFileError,
  zToDiskSaveFileError
} from './save-file-error';

export type ToDiskSaveFileResponse = ToDiskResponseBase<
  'saveFile',
  ToDiskSaveFileOutput,
  ToDiskSaveFileError
>;

export type ToDiskSaveFileOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskSaveFileOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskSaveFileOutput' });

export let zToDiskSaveFileResponse = makeToDiskResponseSchema({
  operation: 'saveFile',
  output: zToDiskSaveFileOutput,
  error: zToDiskSaveFileError
});

assertTypesEqual<ToDiskSaveFileOutput, z.infer<typeof zToDiskSaveFileOutput>>({
  value: true
});

assertTypesEqual<
  ToDiskSaveFileResponse,
  z.infer<typeof zToDiskSaveFileResponse>
>({ value: true });
