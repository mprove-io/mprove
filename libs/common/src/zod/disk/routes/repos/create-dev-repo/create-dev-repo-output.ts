import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';

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

assertTypesEqual<
  ToDiskCreateDevRepoOutput,
  z.infer<typeof zToDiskCreateDevRepoOutput>
>({ value: true });
