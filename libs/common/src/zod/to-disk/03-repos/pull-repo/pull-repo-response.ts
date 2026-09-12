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
  type ToDiskPullRepoError,
  zToDiskPullRepoError
} from './pull-repo-error';

export type ToDiskPullRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskPullRepoResponse = ToDiskResponse<
  'pullRepo',
  ToDiskPullRepoOutput,
  ToDiskPullRepoError
>;

export let zToDiskPullRepoResponse = makeToDiskResponseSchema({
  operation: 'pullRepo',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskPullRepoOutput' }),
  error: zToDiskPullRepoError
});

assertTypesEqual<
  ToDiskPullRepoResponse,
  z.infer<typeof zToDiskPullRepoResponse>
>({ value: true });
