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
  type ToDiskGetCatalogFilesError,
  zToDiskGetCatalogFilesError
} from './get-catalog-files-error';

export type ToDiskGetCatalogFilesOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskGetCatalogFilesResponse = ToDiskResponse<
  'getCatalogFiles',
  ToDiskGetCatalogFilesOutput,
  ToDiskGetCatalogFilesError
>;

export let zToDiskGetCatalogFilesResponse = makeToDiskResponseSchema({
  operation: 'getCatalogFiles',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskGetCatalogFilesOutput' }),
  error: zToDiskGetCatalogFilesError
});

assertTypesEqual<
  ToDiskGetCatalogFilesResponse,
  z.infer<typeof zToDiskGetCatalogFilesResponse>
>({ value: true });
