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
  type ToDiskGetCatalogFilesError,
  zToDiskGetCatalogFilesError
} from './get-catalog-files-error';

export type ToDiskGetCatalogFilesResponse = ToDiskResponseBase<
  'getCatalogFiles',
  ToDiskGetCatalogFilesOutput,
  ToDiskGetCatalogFilesError
>;

export type ToDiskGetCatalogFilesOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskGetCatalogFilesOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskGetCatalogFilesOutput' });

export let zToDiskGetCatalogFilesResponse = makeToDiskResponseSchema({
  operation: 'getCatalogFiles',
  output: zToDiskGetCatalogFilesOutput,
  error: zToDiskGetCatalogFilesError
});

assertTypesEqual<
  ToDiskGetCatalogFilesOutput,
  z.infer<typeof zToDiskGetCatalogFilesOutput>
>({ value: true });

assertTypesEqual<
  ToDiskGetCatalogFilesResponse,
  z.infer<typeof zToDiskGetCatalogFilesResponse>
>({ value: true });
