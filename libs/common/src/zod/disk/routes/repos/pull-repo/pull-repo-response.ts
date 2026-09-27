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
  type ToDiskPullRepoError,
  zToDiskPullRepoError
} from './pull-repo-error';

export type ToDiskPullRepoResponse = ToDiskResponseBase<
  'pullRepo',
  ToDiskPullRepoOutput,
  ToDiskPullRepoError
>;

export type ToDiskPullRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskPullRepoOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskPullRepoOutput' });

export let zToDiskPullRepoResponse = makeToDiskResponseSchema({
  operation: 'pullRepo',
  output: zToDiskPullRepoOutput,
  error: zToDiskPullRepoError
});

assertTypesEqual<ToDiskPullRepoOutput, z.infer<typeof zToDiskPullRepoOutput>>({
  value: true
});

assertTypesEqual<
  ToDiskPullRepoResponse,
  z.infer<typeof zToDiskPullRepoResponse>
>({ value: true });
