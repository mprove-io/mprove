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
  type ToDiskSeedProjectError,
  zToDiskSeedProjectError
} from './seed-project-error';

export type ToDiskSeedProjectResponse = ToDiskResponseBase<
  'seedProject',
  ToDiskSeedProjectOutput,
  ToDiskSeedProjectError
>;

export type ToDiskSeedProjectOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskSeedProjectOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskSeedProjectOutput' });

export let zToDiskSeedProjectResponse = makeToDiskResponseSchema({
  operation: 'seedProject',
  output: zToDiskSeedProjectOutput,
  error: zToDiskSeedProjectError
});

assertTypesEqual<
  ToDiskSeedProjectOutput,
  z.infer<typeof zToDiskSeedProjectOutput>
>({ value: true });

assertTypesEqual<
  ToDiskSeedProjectResponse,
  z.infer<typeof zToDiskSeedProjectResponse>
>({ value: true });
