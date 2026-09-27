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
  type ToDiskPushRepoError,
  zToDiskPushRepoError
} from './push-repo-error';

export type ToDiskPushRepoResponse = ToDiskResponseBase<
  'pushRepo',
  ToDiskPushRepoOutput,
  ToDiskPushRepoError
>;

export type ToDiskPushRepoOutput = {
  repo: Repo;
  productionFiles: DiskCatalogFile[];
  productionMproveDir: string;
};

export let zToDiskPushRepoOutput = z
  .object({
    repo: zRepo,
    productionFiles: z.array(zDiskCatalogFile),
    productionMproveDir: z.string()
  })
  .meta({ id: 'ToDiskPushRepoOutput' });

export let zToDiskPushRepoResponse = makeToDiskResponseSchema({
  operation: 'pushRepo',
  output: zToDiskPushRepoOutput,
  error: zToDiskPushRepoError
});

assertTypesEqual<ToDiskPushRepoOutput, z.infer<typeof zToDiskPushRepoOutput>>({
  value: true
});

assertTypesEqual<
  ToDiskPushRepoResponse,
  z.infer<typeof zToDiskPushRepoResponse>
>({ value: true });
