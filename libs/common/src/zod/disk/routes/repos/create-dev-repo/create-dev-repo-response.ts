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
  type ToDiskCreateDevRepoError,
  zToDiskCreateDevRepoError
} from './create-dev-repo-error';

export type ToDiskCreateDevRepoResponse = ToDiskResponseBase<
  'createDevRepo',
  ToDiskCreateDevRepoOutput,
  ToDiskCreateDevRepoError
>;

export type ToDiskCreateDevRepoOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
  initialCommitHash?: string;
};

export let zToDiskCreateDevRepoOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string(),
    initialCommitHash: z.string().nullish()
  })
  .meta({ id: 'ToDiskCreateDevRepoOutput' });

export let zToDiskCreateDevRepoResponse = makeToDiskResponseSchema({
  operation: 'createDevRepo',
  output: zToDiskCreateDevRepoOutput,
  error: zToDiskCreateDevRepoError
});

assertTypesEqual<
  ToDiskCreateDevRepoOutput,
  z.infer<typeof zToDiskCreateDevRepoOutput>
>({ value: true });

assertTypesEqual<
  ToDiskCreateDevRepoResponse,
  z.infer<typeof zToDiskCreateDevRepoResponse>
>({ value: true });
