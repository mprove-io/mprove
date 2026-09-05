import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogFile,
  zDiskCatalogFile
} from '#common/zod/disk/disk-catalog-file';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskRenameCatalogNodeResponsePayload = {
  repo: Repo;
  files: DiskCatalogFile[];
  mproveDir: string;
};

export let zToDiskRenameCatalogNodeResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRenameCatalogNodeResponsePayload' });

assertTypesEqual<
  ToDiskRenameCatalogNodeResponsePayload,
  z.infer<typeof zToDiskRenameCatalogNodeResponsePayload>
>({ value: true });
