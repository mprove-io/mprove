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
  type ToDiskPushRepoError,
  zToDiskPushRepoError
} from './push-repo-error';

export type ToDiskPushRepoOutput = {
  repo: Repo;
  productionFiles: DiskCatalogFile[];
  productionMproveDir: string;
};

export type ToDiskPushRepoResponse = ToDiskResponse<
  'pushRepo',
  ToDiskPushRepoOutput,
  ToDiskPushRepoError
>;

export let zToDiskPushRepoResponse = makeToDiskResponseSchema({
  operation: 'pushRepo',
  success: z
    .object({
      repo: zRepo,
      productionFiles: z.array(zDiskCatalogFile),
      productionMproveDir: z.string()
    })
    .meta({ id: 'ToDiskPushRepoOutput' }),
  error: zToDiskPushRepoError
});

assertTypesEqual<
  ToDiskPushRepoResponse,
  z.infer<typeof zToDiskPushRepoResponse>
>({ value: true });
