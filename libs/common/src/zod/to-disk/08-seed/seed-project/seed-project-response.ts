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
  type ToDiskSeedProjectError,
  zToDiskSeedProjectError
} from './seed-project-error';

export type ToDiskSeedProjectOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export type ToDiskSeedProjectResponse = ToDiskResponse<
  'seedProject',
  ToDiskSeedProjectOutput,
  ToDiskSeedProjectError
>;

export let zToDiskSeedProjectResponse = makeToDiskResponseSchema({
  operation: 'seedProject',
  success: z
    .object({
      repo: zRepo,
      files: z.array(zDiskCatalogFile),
      mproveDir: z.string()
    })
    .meta({ id: 'ToDiskSeedProjectOutput' }),
  error: zToDiskSeedProjectError
});

assertTypesEqual<
  ToDiskSeedProjectResponse,
  z.infer<typeof zToDiskSeedProjectResponse>
>({ value: true });
