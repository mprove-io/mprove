import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskRenameCatalogNodeOutput = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskRenameCatalogNodeOutput = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRenameCatalogNodeOutput' });

assertTypesEqual<
  ToDiskRenameCatalogNodeOutput,
  z.infer<typeof zToDiskRenameCatalogNodeOutput>
>({ value: true });
