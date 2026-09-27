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
  type ToDiskMergeRepoError,
  zToDiskMergeRepoError
} from './merge-repo-error';

export type ToDiskMergeRepoResponse = ToDiskResponseBase<
  'mergeRepo',
  ToDiskMergeRepoOutput,
  ToDiskMergeRepoError
>;

export type ToDiskMergeRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskMergeRepoOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskMergeRepoOutput' });

export let zToDiskMergeRepoResponse = makeToDiskResponseSchema({
  operation: 'mergeRepo',
  output: zToDiskMergeRepoOutput,
  error: zToDiskMergeRepoError
});

assertTypesEqual<ToDiskMergeRepoOutput, z.infer<typeof zToDiskMergeRepoOutput>>(
  { value: true }
);

assertTypesEqual<
  ToDiskMergeRepoResponse,
  z.infer<typeof zToDiskMergeRepoResponse>
>({ value: true });
