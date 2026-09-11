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
  type ToDiskMergeRepoError,
  zToDiskMergeRepoError
} from './merge-repo-error';

export type ToDiskMergeRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskMergeRepoResponse = ToDiskResponse<
  'ToDiskMergeRepo',
  ToDiskMergeRepoOutput,
  ToDiskMergeRepoError
>;

export let zToDiskMergeRepoResponse = makeToDiskResponseSchema({
  path: 'ToDiskMergeRepo',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskMergeRepoOutput' }),
  error: zToDiskMergeRepoError
});

assertTypesEqual<
  ToDiskMergeRepoResponse,
  z.infer<typeof zToDiskMergeRepoResponse>
>({ value: true });
