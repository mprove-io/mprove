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
  type ToDiskCreateDevRepoError,
  zToDiskCreateDevRepoError
} from './create-dev-repo-error';

export type ToDiskCreateDevRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
  initialCommitHash?: string;
};

export type ToDiskCreateDevRepoResponse = ToDiskResponse<
  'ToDiskCreateDevRepo',
  ToDiskCreateDevRepoOutput,
  ToDiskCreateDevRepoError
>;

export let zToDiskCreateDevRepoResponse = makeToDiskResponseSchema({
  path: 'ToDiskCreateDevRepo',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string(),
      initialCommitHash: z.string().nullish()
    })
    .meta({ id: 'ToDiskCreateDevRepoOutput' }),
  error: zToDiskCreateDevRepoError
});

assertTypesEqual<
  ToDiskCreateDevRepoResponse,
  z.infer<typeof zToDiskCreateDevRepoResponse>
>({ value: true });
